import { Storage } from "@google-cloud/storage";
import { readFileSync } from "fs";
import { config } from "dotenv";

config({ path: "./.env.local" });

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
if (!projectId) {
  throw new Error("GOOGLE_CLOUD_PROJECT_ID is not set");
}

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
if (!bucketName) {
  throw new Error("GOOGLE_CLOUD_BUCKET_NAME is not set");
}

const keyFileContents = readFileSync("./google-cloud-key.json", "utf8");

const storage = new Storage({
  projectId: projectId,
  credentials: JSON.parse(keyFileContents),
});

const bucket = storage.bucket(bucketName || "");

export { storage, bucket };
