"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileIcon, UploadIcon } from "@/components/ui/Icons";

export interface KernelUploadResponse {
  message: string;
  kernel: {
    name: string;
    url: string;
    size: number;
    checksum: string;
  };
}

interface KernelUploaderProps {
  onUploadComplete: (response: KernelUploadResponse) => void;
}

export function KernelUploader({ onUploadComplete }: KernelUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    await handleFiles(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];

    // Validate file size (10MB - 50MB)
    const minSize = 9 * 1024 * 1024; // 9MB
    const maxSize = 51 * 1024 * 1024; // 51MB

    if (file.size < minSize || file.size > maxSize) {
      setError(
        `Kernel file size must be between 10MB and 50MB. Current size: ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB`,
      );
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Only .zip files are allowed");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-kernel", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUploadComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-primary/10 overflow-hidden"
      >
        <div className="bg-card/30 px-6 py-8 sm:px-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mb-8"
          >
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Upload Kernel
            </h2>
          </motion.div>

          <div
            className={cn(
              "relative rounded-lg border-2 border-dashed p-8",
              "transition-colors duration-200",
              isDragging ? "border-primary" : "border-primary/20",
              "hover:border-primary/50",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".zip"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInput}
              disabled={uploading}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-primary/5">
                {uploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <UploadIcon className="w-8 h-8 text-primary/60" />
                  </motion.div>
                ) : (
                  <FileIcon className="w-8 h-8 text-primary/60" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {uploading
                    ? "Uploading..."
                    : "Drop your kernel file here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Only .zip files between 10MB and 50MB are allowed
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <p className="text-sm text-destructive text-center">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
