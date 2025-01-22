"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadIcon, LoadingIcon } from "@/components/ui/Icons";

interface DirectLinkUploaderProps {
  onUploadSuccessAction: (file: { name: string; url: string }) => void;
  onUploadErrorAction: (error: string) => void;
}

export function DirectLinkUploader({
  onUploadSuccessAction,
  onUploadErrorAction,
}: DirectLinkUploaderProps) {
  const [directLink, setDirectLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!directLink) {
      onUploadErrorAction("Please enter a direct download link");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ directLink }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.file && data.file.name && data.file.url) {
        onUploadSuccessAction(data.file);
        setDirectLink("");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      onUploadErrorAction((error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="direct-link-uploader"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="mt-6 w-full max-w-md mx-auto"
      >
        <h3 className="text-xl font-semibold mb-4 text-center">
          Upload from Direct Link
        </h3>
        <p className="text-sm mb-4 text-center text-muted-foreground">
          Upload files from direct download links (500MB - 3GB)
        </p>
        <div className="flex flex-col space-y-4">
          <Input
            type="text"
            placeholder="Enter direct download link"
            value={directLink}
            onChange={(e) => setDirectLink(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
            disabled={isUploading}
          />
          <Button
            onClick={handleUpload}
            disabled={isUploading || !directLink}
            className={cn(
              "w-full py-3 px-4 font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out text-lg",
              directLink && !isUploading
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <LoadingIcon className="mr-3 h-6 w-6 animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <UploadIcon className="w-6 h-6 mr-3" /> Upload from Link
              </span>
            )}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
