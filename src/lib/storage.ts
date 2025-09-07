import { Storage } from "@google-cloud/storage";
import { readFileSync, existsSync } from "fs";
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

// Use service account key file if it exists (local development)
// Otherwise use Application Default Credentials (Cloud Run)
let storage: Storage;
const keyFilePath = "./google-cloud-key.json";

if (existsSync(keyFilePath)) {
  const keyFileContents = readFileSync(keyFilePath, "utf8");
  storage = new Storage({
    projectId: projectId,
    credentials: JSON.parse(keyFileContents),
  });
} else {
  // Use Application Default Credentials (ADC) for Cloud Run
  storage = new Storage({
    projectId: projectId,
  });
}

const bucket = storage.bucket(bucketName || "");

export { storage, bucket };
