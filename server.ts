import express, { Request, Response } from "express";
import next from "next";
import { cloudStorage } from "./src/lib/cloudStorage";
import { getPrisma } from "./src/lib/prisma";
import cors from "cors";
import busboy from "busboy";
import stream from "stream";
import { promisify } from "util";
import { config } from "dotenv";

config({ path: "./.env.local " });

const pipeline = promisify(stream.pipeline);

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
app.use(cors());

const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024; // 3 GB in bytes
const BASE_URL = process.env.WEB_URL || "http://localhost:3000";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  throw new Error("ADMIN_API_KEY environment variable is not set");
}

async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/keys/verify?key=${apiKey}`);
    if (response.ok) {
      const data = await response.json();
      return data.valid === true;
    }
    return false;
  } catch (error) {
    console.error("Error verifying API key:", error);
    return false;
  }
}

async function getApiKeyDescription(apiKey: string): Promise<string | null> {
  const prisma = await getPrisma();
  const apiKeyData = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    select: { description: true },
  });
  return apiKeyData ? apiKeyData.description : null;
}

async function uploadFromDirectLink(
  directLink: string
): Promise<{ name: string; url: string }> {
  const response = await fetch(directLink);
  if (!response.ok) throw new Error(`Failed to fetch file from ${directLink}`);

  const contentType =
    response.headers.get("content-type") || "application/octet-stream";
  const contentDisposition = response.headers.get("content-disposition");
  const sourceUrl = new URL(directLink);
  let filename = sourceUrl.pathname.split("/").pop() || "downloaded_file";

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
    if (filenameMatch) {
      filename = filenameMatch[1].replace(/^"|"$/g, "");
    }
  }

  filename = filename.replace(/"/g, "");

  // Create blob stream
  const blobStream = cloudStorage.createWriteStream(filename);

  if (response.body) {
    // @ts-ignore
    await pipeline(response.body, blobStream);
  } else {
    throw new Error("Response body is null");
  }

  await cloudStorage.makeFilePublic(filename);

  await cloudStorage.setFileMetadata(filename, {
    contentType,
    contentDisposition: `${contentType.startsWith("text/") ? "inline" : "attachment"}; filename="${filename}"`,
  });

  const downloadUrl = `${BASE_URL}/api/download?filename=${encodeURIComponent(filename)}`;
  return { name: filename, url: downloadUrl };
}

nextApp.prepare().then(() => {
  // @ts-ignore
  app.post("/api/upload", async (req: Request, res: Response) => {
    const prisma = await getPrisma();
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey || !(await verifyApiKey(apiKey))) {
      return res.status(401).json({
        error: "Unauthorized: Invalid or missing API key",
        key: apiKey,
      });
    }

    console.log("Upload started");

    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      let body;
      try {
        body = await new Promise<any>((resolve, reject) => {
          let data = "";
          req.on("data", (chunk) => {
            data += chunk;
          });
          req.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        });
      } catch (error) {
        console.log("Upload canceled: Invalid JSON body"); // Log upload canceled
        return res.status(400).json({ error: "Invalid JSON body" });
      }

      if (body && body.directLink) {
        try {
          const uploadedFile = await uploadFromDirectLink(body.directLink);
          const apikey = await getApiKeyDescription(apiKey);
          console.log("Upload completed successfully");
          console.log(
            `Uploaded file details: Name: ${uploadedFile.name}, URL: ${uploadedFile.url}, apiKey: ${apikey}`
          );
          return res.json({
            message: "File uploaded successfully from direct link",
            file: uploadedFile,
          });
        } catch (error) {
          console.error(error);
          console.log("Upload canceled: Error uploading from direct link"); // Log upload canceled
          return res.status(500).json({
            error: `Error uploading file from direct link: ${(error as Error).message}`,
          });
        }
      }
    }

    const bb = busboy({ headers: req.headers });
    const uploadPromises: Promise<{ name: string; url: string }>[] = [];
    let filesUploaded = 0;

    bb.on("file", (fieldname, file, info) => {
      if (fieldname !== "files") {
        file.resume();
        return;
      }

      const { filename, mimeType } = info;
      if (!filename) {
        file.resume();
        return;
      }

      filesUploaded++;
      let fileSize = 0;
      const blobStream = cloudStorage.createWriteStream(filename);

      const uploadPromise = new Promise<{ name: string; url: string }>(
        (resolveUpload, rejectUpload) => {
          file.on("data", (data) => {
            fileSize += data.length;
            if (fileSize > MAX_FILE_SIZE) {
              file.resume();
              blobStream.destroy(
                new Error(
                  `File ${filename} exceeds the maximum allowed size of 6 GB.`
                )
              );
              console.log(
                `Upload canceled: File ${filename} exceeds size limit`
              ); // Log upload canceled
              rejectUpload(
                new Error(
                  `File ${filename} exceeds the maximum allowed size of 6 GB.`
                )
              );
            }
          });

          file.pipe(blobStream);

          blobStream.on("finish", async () => {
            try {
              await cloudStorage.makeFilePublic(filename);
              await cloudStorage.setFileMetadata(filename, {
                contentType: mimeType,
                contentDisposition: `${mimeType.startsWith("text/") ? "inline" : "attachment"}; filename="${filename}"`,
              });

              const fileUrl = `${BASE_URL}/api/download?filename=${encodeURIComponent(filename)}`;
              console.log(
                `Uploaded file details: Name: ${filename}, URL: ${fileUrl}`
              ); // Log file details
              resolveUpload({ name: filename, url: fileUrl });
            } catch (error) {
              console.log(`Upload canceled: Error processing ${filename}`); // Log upload canceled
              rejectUpload(error);
            }
          });

          blobStream.on("error", (error) => {
            console.log(`Upload canceled: Error uploading ${filename}`); // Log upload canceled
            rejectUpload(error);
          });
        }
      );

      uploadPromises.push(uploadPromise);
    });

    bb.on("finish", async () => {
      if (!filesUploaded) {
        console.log("Upload canceled: No valid file was uploaded"); // Log upload canceled
        res.status(400).json({ error: "No valid file was uploaded" });
      } else {
        try {
          const uploadedFiles = await Promise.all(uploadPromises);
          res.json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
          });
          const apiKeyDescription = await getApiKeyDescription(apiKey);
          await prisma.fileStats.deleteMany({
            where: {
              filename: {
                in: uploadedFiles.map((file) => file.name),
              },
            },
          });
          await prisma.fileStats.createMany({
            data: uploadedFiles.map((file) => ({
              filename: file.name,
              views: 0,
              downloads: 0,
              uploadedKey: apiKeyDescription,
            })),
          });
          console.log(
            `Upload completed: Files uploaded with the following names: ${uploadedFiles.map((file) => file.name).join(", ")} using the api key: ${apiKeyDescription}`
          );
        } catch (error) {
          console.log("Upload canceled: Error uploading files"); // Log upload canceled
          res.status(500).json({
            error: `Error uploading files: ${(error as Error).message}`,
          });
        }
      }
    });

    bb.on("error", (error) => {
      console.error(error);
      console.log("Upload canceled: Error in busboy"); // Log upload canceled
      res
        .status(500)
        .json({ error: `Error uploading files: ${(error as Error).message}` });
    });

    req.pipe(bb);
  });

  // Handle all other routes with Next.js
  app.all("*", (req: Request, res: Response) => {
    return handle(req, res);
  });

  const findAvailablePort = async (port: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const server = app.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
        resolve(port);
      });

      server.on("error", async (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          console.log(`Port ${port} is in use, trying another port...`);
          server.close();
          const nextPort = await findAvailablePort(port + 1);
          resolve(nextPort);
        } else {
          reject(error);
        }
      });
    });
  };

  findAvailablePort(port as number).catch((error) => {
    console.error("Failed to start server:", error);
  });
});

console.log("Preparing Next.js app...");
