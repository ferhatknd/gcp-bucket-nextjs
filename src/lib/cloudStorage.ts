import { bucket } from "./storage";
import { Readable } from "stream";

export const cloudStorage = {
  uploadFile: async (file: Buffer, filename: string) => {
    const blob = bucket.file(filename);
    await blob.save(file);
    await blob.makePublic();
    return filename;
  },
  createWriteStream: (filename: string) => {
    const blob = bucket.file(filename);
    return blob.createWriteStream();
  },
  getWriteStream: (filename: string) => {
    const blob = bucket.file(filename);
    return blob.createWriteStream();
  },
  makeFilePublic: async (filename: string) => {
    const blob = bucket.file(filename);
    await blob.makePublic();
  },
  downloadFile: async (filename: string) => {
    const [fileContents] = await bucket.file(filename).download();
    return fileContents;
  },
  deleteFile: async (filename: string) => {
    await bucket
      .file(filename)
      .delete()
      .catch(() => {});
  },
  renameFile: async (oldFilename: string, newFilename: string) => {
    await bucket.file(oldFilename).rename(newFilename);
    await cloudStorage.makeFilePublic(newFilename);
    await cloudStorage.setFileMetadata(newFilename, {
      contentDisposition: `attachment; filename="${newFilename}"`,
    });
  },
  fileExists: async (filename: string): Promise<boolean> => {
    const [exists] = await bucket.file(filename).exists();
    return exists;
  },
  setFileMetadata: async (
    filename: string,
    metadata: { [key: string]: string },
  ) => {
    await bucket.file(filename).setMetadata(metadata);
  },
  getFileMetadata: async (filename: string) => {
    const [metadata] = await bucket.file(filename).getMetadata();
    return metadata;
  },
  listFiles: async (prefix?: string) => {
    const [files] = await bucket.getFiles({ prefix, autoPaginate: false });
    return files;
  },
  createReadStream: (filename: string): Readable => {
    return bucket.file(filename).createReadStream();
  },
};
