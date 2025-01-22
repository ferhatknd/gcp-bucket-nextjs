import express, { Request, Response } from "express";
import next from "next";
import { cloudStorage } from "./src/lib/cloudStorage";
import cors from "cors";
import busboy from "busboy";
import { config } from "dotenv";
import path from "path";
import fs from "fs/promises";

config({ path: "./.env.local " });

// Constants
const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024; // 3 GB
const MIN_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
const BASE_URL = process.env.WEB_URL || "http://localhost:3000";
const PORT = parseInt(process.env.PORT || "3000", 10);
const IS_DEV = process.env.NODE_ENV !== "production";

// Forbidden MIME types
const FORBIDDEN_MIME_TYPES = new Set(["audio/", "video/", "text/"]);

// File upload interface
interface UploadedFile {
  name: string;
  url: string;
}

// Error handling
class UploadError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

// Utility functions
const validateFileType = (mimeType: string, _filename: string): void => {
  const isForbiddenType = Array.from(FORBIDDEN_MIME_TYPES).some((type) =>
    mimeType.startsWith(type),
  );

  if (isForbiddenType) {
    throw new UploadError(
      `File type not allowed: ${mimeType}. Audio, video, and text files are not permitted.`,
      400,
    );
  }
};

const validateFileSize = (size: number, filename: string): void => {
  if (size < MIN_FILE_SIZE) {
    throw new UploadError(
      `File ${filename} is too small. Minimum size is 500 MB.`,
      400,
    );
  }
  if (size > MAX_FILE_SIZE) {
    throw new UploadError(
      `File ${filename} is too large. Maximum size is 3 GB.`,
      400,
    );
  }
};

const generateDownloadUrl = (filename: string): string =>
  `${BASE_URL}/api/download?filename=${encodeURIComponent(filename)}`;

const getContentDisposition = (
  _contentType: string,
  filename: string,
): string => `attachment; filename="${filename}"`; // Always use attachment since we don't allow text files

async function uploadFromDirectLink(directLink: string): Promise<UploadedFile> {
  try {
    const response = await fetch(directLink);
    if (!response.ok)
      throw new UploadError(
        `Failed to fetch file: ${response.statusText}`,
        400,
      );

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    validateFileType(contentType, directLink);

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      const fileSize = parseInt(contentLength, 10);
      validateFileSize(fileSize, directLink);
    }

    const filename = extractFilename(
      directLink,
      response.headers.get("content-disposition"),
    );
    const blobStream = cloudStorage.createWriteStream(filename);

    if (!response.body) throw new UploadError("Response body is null", 400);

    return new Promise((resolve, reject) => {
      let totalBytes = 0;
      // @ts-ignore
      const reader = response.body.getReader();

      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              blobStream.end();
              break;
            }

            totalBytes += value.length;
            if (totalBytes > MAX_FILE_SIZE) {
              reader.cancel();
              blobStream.destroy();
              await cloudStorage.deleteFile(filename);
              reject(new UploadError("File exceeds maximum size limit", 400));
              return;
            }

            const writeResult = blobStream.write(value);
            if (!writeResult) {
              await new Promise((resolve) => blobStream.once("drain", resolve));
            }
          }
        } catch (error) {
          reader.cancel();
          blobStream.destroy();
          await cloudStorage.deleteFile(filename);
          reject(
            new UploadError(
              `Stream reading error: ${(error as Error).message}`,
            ),
          );
        }
      };

      blobStream.on("finish", async () => {
        try {
          if (totalBytes < MIN_FILE_SIZE) {
            await cloudStorage.deleteFile(filename);
            reject(
              new UploadError("File size is below minimum requirement", 400),
            );
            return;
          }
          await finalizeUpload(filename, contentType);
          resolve({
            name: filename,
            url: generateDownloadUrl(filename),
          });
        } catch (error) {
          await cloudStorage.deleteFile(filename);
          reject(
            new UploadError(
              `Failed to finalize upload: ${(error as Error).message}`,
            ),
          );
        }
      });

      blobStream.on("error", async (error) => {
        reader.cancel();
        await cloudStorage.deleteFile(filename);
        reject(new UploadError(`Stream error: ${error.message}`));
      });

      pump();
    });
  } catch (error) {
    if (error instanceof UploadError) throw error;
    throw new UploadError(
      `Failed to upload from direct link: ${(error as Error).message}`,
    );
  }
}

function extractFilename(
  directLink: string,
  contentDisposition: string | null,
): string {
  let filename =
    new URL(directLink).pathname.split("/").pop() || "downloaded_file";

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
    if (filenameMatch) {
      filename = filenameMatch[1].replace(/^"|"$/g, "");
    }
  }

  return filename.replace(/"/g, "");
}

async function finalizeUpload(
  filename: string,
  contentType: string,
): Promise<void> {
  await cloudStorage.makeFilePublic(filename);
  await cloudStorage.setFileMetadata(filename, {
    contentType,
    contentDisposition: getContentDisposition(contentType, filename),
    cacheControl: "public, max-age=3600",
  });
}

async function handleFileUpload(
  file: NodeJS.ReadableStream,
  filename: string,
  mimeType: string,
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    let fileSize = 0;
    let isStreamDestroyed = false;

    try {
      validateFileType(mimeType, filename);
    } catch (error) {
      if (typeof (file as any).destroy === "function") {
        (file as any).destroy();
      }
      reject(error);
      return;
    }

    const blobStream = cloudStorage.createWriteStream(filename);
    let sizeValidated = false;

    const cleanup = (error?: Error) => {
      if (!isStreamDestroyed) {
        isStreamDestroyed = true;
        if (typeof (file as any).destroy === "function") {
          (file as any).destroy();
        }
        blobStream.destroy();
        cloudStorage.deleteFile(filename).catch(console.error);
      }
      if (error) {
        reject(
          error instanceof UploadError ? error : new UploadError(error.message),
        );
      }
    };

    file.on("data", (data) => {
      if (isStreamDestroyed) return;

      fileSize += data.length;

      try {
        if (!sizeValidated && fileSize >= MIN_FILE_SIZE) {
          sizeValidated = true;
        }
        if (fileSize > MAX_FILE_SIZE) {
          const error = new UploadError(
            `File ${filename} exceeds the maximum allowed size of 3GB`,
            400,
          );
          cleanup(error);
        }
      } catch (error) {
        cleanup(error as Error);
      }
    });

    file.on("end", () => {
      if (isStreamDestroyed) return;

      if (!sizeValidated) {
        cleanup(
          new UploadError(
            `File ${filename} is smaller than the minimum size of 500 MB`,
            400,
          ),
        );
      }
    });

    file.on("error", (error) => {
      cleanup(new UploadError(`File stream error: ${error.message}`, 400));
    });

    blobStream.on("error", (error) => {
      cleanup(new UploadError(`Storage stream error: ${error.message}`, 500));
    });

    file.pipe(blobStream).on("finish", async () => {
      if (isStreamDestroyed) return;

      try {
        await finalizeUpload(filename, mimeType);
        resolve({ name: filename, url: generateDownloadUrl(filename) });
      } catch (error) {
        cleanup(
          new UploadError(
            `Failed to process uploaded file: ${(error as Error).message}`,
            500,
          ),
        );
      }
    });
  });
}

// Express app setup
const nextApp = next({ dev: IS_DEV });
const handle = nextApp.getRequestHandler();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

nextApp.prepare().then(() => {
  // @ts-ignore
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      if (req.is("application/json")) {
        const { directLink } = req.body;
        if (!directLink) throw new UploadError("Direct link is required", 400);

        const uploadedFile = await uploadFromDirectLink(directLink);
        return res.json({
          message: "File uploaded successfully from direct link",
          file: uploadedFile,
        });
      }

      const uploadedFiles = await handleMultipartUpload(req);
      res.json({
        message: "Files uploaded successfully",
        files: uploadedFiles,
      });
    } catch (error) {
      const uploadError =
        error instanceof UploadError
          ? error
          : new UploadError((error as Error).message);
      res.status(uploadError.statusCode).json({ error: uploadError.message });
    }
  });

  app.get("/api/download-script", async (req: Request, res: Response) => {
    try {
      // Read the script file
      const scriptPath = path.join(
        process.cwd(),
        "scripts",
        "upload-script.sh",
      );
      let script = await fs.readFile(scriptPath, "utf8");

      // Replace the placeholder with actual server URL
      const serverUrl = BASE_URL;
      script = script.replace("__SERVER_URL__", serverUrl);

      // Set headers and send response
      res.setHeader("Content-Type", "application/x-sh");
      res.setHeader("Content-Disposition", 'attachment; filename="upload.sh"');
      res.setHeader("X-Suggested-Filename", "upload.sh");

      res.send(script);
    } catch (error) {
      console.error("Error serving script:", error);
      res.status(500).send("Error serving upload script");
    }
  });

  app.all("*", (req: Request, res: Response) => handle(req, res));

  startServer();
});

async function handleMultipartUpload(req: Request): Promise<UploadedFile[]> {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers });
    const uploadPromises: Promise<UploadedFile>[] = [];
    let hasError = false;

    bb.on("file", (fieldname, file, info) => {
      if (hasError) {
        file.resume(); // Skip processing if we already have an error
        return;
      }

      if (fieldname === "files" && info.filename) {
        try {
          validateFileType(info.mimeType, info.filename);
          const uploadPromise = handleFileUpload(
            file,
            info.filename,
            info.mimeType,
          ).catch((error) => {
            hasError = true;
            throw error;
          });
          uploadPromises.push(uploadPromise);
        } catch (err) {
          hasError = true;
          file.resume(); // Discard the file
          reject(
            err instanceof UploadError
              ? err
              : new UploadError((err as Error).message, 400),
          );
        }
      } else {
        file.resume();
      }
    });

    bb.on("finish", () => {
      if (hasError) return; // Skip if we already have an error

      if (uploadPromises.length === 0) {
        reject(new UploadError("No valid files were uploaded", 400));
      } else {
        Promise.all(uploadPromises)
          .then(resolve)
          .catch((error) => {
            reject(
              error instanceof UploadError
                ? error
                : new UploadError(error.message, 500),
            );
          });
      }
    });

    bb.on("error", (err: Error) =>
      reject(new UploadError(`File upload error: ${err.message}`, 400)),
    );

    req.pipe(bb);
  });
}

async function startServer(port: number = PORT): Promise<void> {
  try {
    await new Promise<void>((resolve, reject) => {
      const server = app.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
        resolve();
      });

      server.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          console.log(`Port ${port} is in use, trying ${port + 1}...`);
          server.close();
          startServer(port + 1);
        } else {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
