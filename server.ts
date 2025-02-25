import express, { Request, Response } from "express";
import next from "next";
import { cloudStorage } from "./src/lib/cloudStorage";
import cors from "cors";
import busboy from "busboy";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { fileTypeFromBuffer } from "file-type";
import dotenv from "dotenv";
import { Readable } from "stream";
import { sendTelegramMessage } from "./src/lib/telegram";

dotenv.config({ path: "./.env.local " });

// Constants
const MAX_FILE_SIZE = 3072 * 1024 * 1024; // 3072 MB (3 GB)
const MIN_FILE_SIZE = 512 * 1024 * 1024; // 512 MB
const BASE_URL = process.env.WEB_URL || "http://localhost:3000";
const PORT = parseInt(process.env.PORT || "3000", 10);
const IS_DEV = process.env.NODE_ENV !== "production";
const KERNEL_MIN_SIZE = 9 * 1024 * 1024; // 9 MB
const KERNEL_MAX_SIZE = 51 * 1024 * 1024; // 51 MB
const ALLOWED_MIME_TYPES = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
  "application/x-zip",
  "multipart/x-zip",
]);
const ALLOWED_EXTENSIONS = new Set([".zip"]);
const FORBIDDEN_MIME_TYPES = new Set(["audio/", "video/", "text/"]);

// File upload interface
interface UploadedFile {
  name: string;
  url: string;
}

// Kernel upload interface
interface KernelUploadResponse {
  message: string;
  kernel: {
    name: string;
    url: string;
    size: number;
    checksum: string;
  };
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
// Unified file processing function
const processFileUpload = async (
  file: NodeJS.ReadableStream,
  filename: string,
  mimeType: string,
): Promise<{ url: string; checksum: string }> => {
  const hash = crypto.createHash("sha256");
  const blobStream = cloudStorage.createWriteStream(filename);

  return new Promise((resolve, reject) => {
    let size = 0;

    file.on("data", (chunk) => {
      size += chunk.length;
      hash.update(chunk);

      // Validate file size while streaming
      if (size > MAX_FILE_SIZE) {
        (file as any).destroy();
        blobStream.destroy();
        reject(
          new UploadError(
            `File size exceeds maximum limit of ${
              MAX_FILE_SIZE / (1024 * 1024)
            }MB`,
            400,
          ),
        );
      }
    });

    file.pipe(blobStream);

    blobStream.on("finish", async () => {
      try {
        // Validate minimum file size after upload
        if (size < MIN_FILE_SIZE) {
          await cloudStorage.deleteFile(filename);
          throw new UploadError(
            `File size is below minimum requirement of ${
              MIN_FILE_SIZE / (1024 * 1024)
            }MB`,
            400,
          );
        }

        await finalizeUpload(filename, mimeType);
        resolve({
          url: generateDownloadUrl(filename),
          checksum: hash.digest("hex"),
        });
      } catch (error) {
        reject(error);
      }
    });

    blobStream.on("error", (error) => {
      reject(new UploadError(`Upload failed: ${error.message}`, 500));
    });
  });
};

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
    if (!response.ok) {
      throw new UploadError(
        `Failed to fetch file: ${response.statusText}`,
        400,
      );
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const contentLength = response.headers.get("content-length");
    const filename = extractFilename(
      directLink,
      response.headers.get("content-disposition"),
    );

    // Pre-validate content length if available
    if (contentLength) {
      const fileSize = parseInt(contentLength, 10);
      validateFileSize(fileSize, filename);
    }

    validateFileType(contentType, filename);

    if (!response.body) {
      throw new UploadError("Response body is null", 400);
    }

    // Create a write stream to cloud storage
    const blobStream = cloudStorage.createWriteStream(filename);
    const hash = crypto.createHash("sha256");
    let size = 0;

    // Convert ReadableStream to Node.js Readable
    // @ts-ignore
    const nodeReadable = Readable.fromWeb(response.body);

    return new Promise((resolve, reject) => {
      // Pipe the response stream directly to cloud storage
      nodeReadable.on("data", (chunk: Buffer) => {
        size += chunk.length;
        hash.update(chunk);

        if (size > MAX_FILE_SIZE) {
          nodeReadable.destroy();
          blobStream.destroy();
          reject(
            new UploadError(
              `File size exceeds maximum limit of ${
                MAX_FILE_SIZE / (1024 * 1024)
              }MB`,
              400,
            ),
          );
        }
      });

      nodeReadable.pipe(blobStream);

      blobStream.on("finish", async () => {
        try {
          if (size < MIN_FILE_SIZE) {
            await cloudStorage.deleteFile(filename);
            throw new UploadError(
              `File size is below minimum requirement of ${
                MIN_FILE_SIZE / (1024 * 1024)
              }MB`,
              400,
            );
          }

          await finalizeUpload(filename, contentType);
          resolve({
            name: filename,
            url: generateDownloadUrl(filename),
          });
        } catch (error) {
          reject(error);
        }
      });

      blobStream.on("error", (error) => {
        nodeReadable.on("error", (error: Error) => {
          blobStream.destroy();
          reject(new UploadError(`Download failed: ${error.message}`, 500));
        });
        blobStream.destroy();
        reject(new UploadError(`Download failed: ${error.message}`, 500));
      });
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
  });
}

async function handleFileUpload(
  file: NodeJS.ReadableStream,
  filename: string,
  mimeType: string,
): Promise<UploadedFile> {
  try {
    validateFileType(mimeType, filename);
    const { url, checksum } = await processFileUpload(file, filename, mimeType);
    return { name: filename, url };
  } catch (error) {
    throw error instanceof UploadError
      ? error
      : new UploadError((error as Error).message);
  }
}

async function validateZipFile(buffer: Buffer): Promise<boolean> {
  // Check for ZIP file signature
  const zipSignature = buffer.slice(0, 4);
  const isPKZip = zipSignature.toString("hex").startsWith("504b0304");

  if (isPKZip) return true;

  // Fallback to file-type detection
  const result = await fileTypeFromBuffer(buffer);
  return (
    result?.mime === "application/zip" ||
    result?.mime === "application/x-zip-compressed" ||
    result?.mime === "application/octet-stream"
  );
}

function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function validateKernelFile(
  filename: string,
  mimeType: string,
  size: number,
): void {
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new UploadError("Only .zip files are allowed", 400);
  }

  const isAllowedMimeType = Array.from(ALLOWED_MIME_TYPES).some(
    (allowed) =>
      mimeType.includes("zip") ||
      mimeType === allowed ||
      mimeType === "application/octet-stream",
  );

  if (!isAllowedMimeType) {
    throw new UploadError(
      `Invalid file type: ${mimeType}. Only ZIP files are allowed`,
      400,
    );
  }

  if (size < KERNEL_MIN_SIZE || size > KERNEL_MAX_SIZE) {
    throw new UploadError(
      `Kernel file size must be between 10MB and 50MB. Current size: ${(
        size /
        1024 /
        1024
      ).toFixed(2)}MB`,
      400,
    );
  }
}

// Express app setup
const nextApp = next({ dev: IS_DEV });
const handle = nextApp.getRequestHandler();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

nextApp.prepare().then(() => {
  // Middleware to prevent POST requests to non-API routes
  // @ts-ignore
  app.use((req: Request, res: Response, next) => {
    const isUploadRoute =
      req.path === "/api/upload" ||
      req.path === "/api/upload-kernel" ||
      req.path === "/api/delete" ||
      req.path === "/api/rename";

    if (req.method === "POST") {
      // Only allow POST requests to specific API upload routes
      if (!isUploadRoute) {
        return res
          .status(405)
          .json({ error: "Method not allowed for this route" });
      }
    }

    next();
  });
  // @ts-ignore
  app.post("/api/upload", async (req: Request, res: Response) => {
    try {
      if (req.is("application/json")) {
        const { directLink } = req.body;
        if (!directLink) throw new UploadError("Direct link is required", 400);

        const uploadedFile = await uploadFromDirectLink(directLink);

        // Send Telegram notification
        await sendTelegramMessage(
          `✅ File uploaded successfully from direct link\n` +
            `📁 Filename: ${uploadedFile.name}\n` +
            `🔗 URL: ${uploadedFile.url}`,
        );

        return res.json({
          message: "File uploaded successfully from direct link",
          file: uploadedFile,
        });
      }

      const uploadedFiles = await handleMultipartUpload(req);

      await sendTelegramMessage(
        `✅ Multiple files uploaded successfully\n` +
          `📁 Number of files: ${uploadedFiles.length}\n` +
          uploadedFiles.map((file) => `- ${file.name}`).join("\n"),
      );

      res.json({
        message: "Files uploaded successfully",
        files: uploadedFiles,
      });
    } catch (error) {
      const uploadError =
        error instanceof UploadError
          ? error
          : new UploadError((error as Error).message);

      await sendTelegramMessage(
        `❌ Upload Error\n` + `⚠️ Error: ${uploadError.message}`,
      );

      res.status(uploadError.statusCode).json({
        error: uploadError.message,
      });
    }
  });

  // @ts-ignore
  app.post("/api/upload-kernel", async (req: Request, res: Response) => {
    try {
      // Initialize buffer to store file chunks
      const chunks: Buffer[] = [];
      let totalSize = 0;

      // Create busboy instance with size limits
      const bb = busboy({
        headers: req.headers,
        limits: {
          fileSize: KERNEL_MAX_SIZE,
          files: 1, // Only allow one file
        },
      });

      return new Promise((resolve, reject) => {
        bb.on("file", async (fieldname, file, info) => {
          const { filename, mimeType } = info;

          // Collect file chunks
          file.on("data", (chunk) => {
            chunks.push(chunk);
            totalSize += chunk.length;

            // Check size limit during upload
            if (totalSize > KERNEL_MAX_SIZE) {
              file.destroy(new Error("File too large"));
            }
          });

          file.on("limit", () => {
            reject(new UploadError("File size limit exceeded", 400));
          });

          file.on("end", async () => {
            try {
              // Combine chunks and validate file
              const fileBuffer = Buffer.concat(chunks);

              // Validate file size
              validateKernelFile(filename, mimeType, fileBuffer.length);

              // Verify it's actually a ZIP file
              const isValidZip = await validateZipFile(fileBuffer);
              if (!isValidZip) {
                throw new UploadError("Invalid ZIP file format", 400);
              }

              // Calculate checksum
              const checksum = calculateChecksum(fileBuffer);

              // Upload to cloud storage
              const blobStream = cloudStorage.createWriteStream(filename);

              const uploadPromise = new Promise(
                (resolveUpload, rejectUpload) => {
                  blobStream.on("finish", async () => {
                    try {
                      await finalizeUpload(filename, mimeType);

                      const response: KernelUploadResponse = {
                        message: "Kernel uploaded successfully",
                        kernel: {
                          name: filename,
                          url: generateDownloadUrl(filename),
                          size: fileBuffer.length,
                          checksum,
                        },
                      };

                      resolveUpload(response);
                    } catch (error) {
                      rejectUpload(error);
                    }
                  });

                  blobStream.on("error", (error) => {
                    rejectUpload(
                      new UploadError(`Upload failed: ${error.message}`, 500),
                    );
                  });

                  // Write the buffer to cloud storage
                  blobStream.end(fileBuffer);
                },
              );

              const result = (await uploadPromise) as KernelUploadResponse;
              await sendTelegramMessage(
                `✅ Kernel uploaded successfully\n` +
                  `📁 Filename: ${result.kernel.name}\n` +
                  `📊 Size: ${(result.kernel.size / (1024 * 1024)).toFixed(2)}MB\n` +
                  `🔐 Checksum: ${result.kernel.checksum}\n` +
                  `🔗 URL: ${result.kernel.url}`,
              );
              resolve(result);
            } catch (error) {
              await sendTelegramMessage(
                `❌ Kernel Upload Error\n` +
                  `⚠️ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              );
              reject(error);
            }
          });
        });

        bb.on("error", (error: Error) => {
          reject(new UploadError(`Upload error: ${error.message}`, 400));
        });

        // Handle case when no file is uploaded
        bb.on("finish", () => {
          if (totalSize === 0) {
            reject(new UploadError("No file uploaded", 400));
          }
        });

        req.pipe(bb);
      })
        .then((result) => res.json(result))
        .catch((error: Error | UploadError) => {
          const statusCode =
            error instanceof UploadError ? error.statusCode : 500;
          res.status(statusCode).json({ error: error.message });
        });
    } catch (error: Error | unknown) {
      const statusCode = error instanceof UploadError ? error.statusCode : 500;
      res.status(statusCode).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
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
    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 10, // Set appropriate limit for maximum number of files
      },
    });
    const uploadPromises: Promise<UploadedFile>[] = [];
    let hasError = false;

    bb.on("file", (fieldname, file, info) => {
      if (hasError) {
        file.resume();
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
          file.resume();
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
      if (hasError) return;

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
