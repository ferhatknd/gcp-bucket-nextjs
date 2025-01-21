"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useFileUploader } from "@/hooks/useFileUploader";
import { DirectLinkUploader } from "./DirectLinkUploader";
import { useState } from "react";
import { UploadIcon, LoadingIcon } from "@/components/ui/Icons";

export function FileUploader({
  onUploadComplete,
}: {
  onUploadComplete: () => void;
}) {
  const {
    files,
    uploading,
    error,
    getRootProps,
    getInputProps,
    isDragActive,
    handleUpload,
    handleRemoveFile,
  } = useFileUploader(onUploadComplete);
  const [directLinkError, setDirectLinkError] = useState<string | null>(null);

  const handleDirectLinkError = (error: string) => {
    setDirectLinkError(error);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-8 lg:mb-12 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-primary items-center justify-center">
          Upload Files
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key="file-uploader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {!files.length ? (
              <div
                {...getRootProps()}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-48 sm:h-56 lg:h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ease-in-out",
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-input hover:border-primary hover:bg-accent/50",
                )}
              >
                <input {...getInputProps()} />
                <UploadIcon className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-3 sm:mb-4 lg:mb-5 text-muted-foreground" />
                <p className="text-sm sm:text-base lg:text-lg text-foreground text-center items-center justify-center">
                  <span className="font-semibold text-primary">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">
                  Max file size: 3 GB
                </p>
              </div>
            ) : null}
            <div className="mt-4 sm:mt-6 lg:mt-8 flex justify-center">
              <Button
                onClick={handleUpload}
                disabled={files.length === 0 || uploading}
                className={cn(
                  "py-3 sm:py-4 lg:py-5 text-base sm:text-lg font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out",
                  files.length > 0 && !uploading
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <LoadingIcon className="mr-3 sm:mr-4 h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 animate-spin" />
                    <span className="text-center">Uploading...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3" />
                    <span className="text-center">Upload Files</span>
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <DirectLinkUploader
          onUploadSuccess={onUploadComplete}
          onUploadError={handleDirectLinkError}
        />
        {directLinkError && (
          <p className="text-red-500 text-sm sm:text-base mt-2 sm:mt-3">
            {directLinkError}
          </p>
        )}

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-sm sm:text-base mt-2 sm:mt-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
