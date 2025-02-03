"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadIcon, LoadingIcon, LinkIcon } from "@/components/ui/Icons";

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
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (!directLink) {
      onUploadErrorAction("Please enter a direct download link");
      return;
    }

    const simulateProgress = () => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 90);
      });
    };

    const progressInterval = setInterval(simulateProgress, 1000);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directLink }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setUploadProgress(100);
      const data = await response.json();
      onUploadSuccessAction(data.file);
    } catch (error) {
      clearInterval(progressInterval);
      onUploadErrorAction((error as Error).message);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  return (
    <motion.div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <div className="space-y-4 sm:space-y-6">
        <motion.div className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-center">
            Upload from Direct Link
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-center text-muted-foreground">
            Upload files from direct download links (500MB - 3GB)
          </p>
        </motion.div>

        <div className="space-y-3 sm:space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter direct download link"
              value={directLink}
              onChange={(e) => setDirectLink(e.target.value)}
              className={cn(
                "h-10 sm:h-12 text-sm sm:text-base",
                "h-12 pl-4 pr-12",
                "bg-background",
                "border-2 border-primary/20",
                "focus:border-primary focus:ring-primary/30",
                "rounded-xl transition-all duration-300",
                "placeholder:text-muted-foreground/60",
              )}
              disabled={isUploading}
            />
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              animate={{ opacity: directLink ? 1 : 0.5 }}
            >
              <LinkIcon className="w-5 h-5 text-primary" />
            </motion.div>
          </div>

          <div className="relative">
            <Button
              onClick={handleUpload}
              disabled={isUploading || !directLink}
              className={cn(
                "h-10 sm:h-12 text-sm sm:text-base",
                "w-full h-12 rounded-xl font-medium",
                "bg-gradient-to-r from-primary to-primary/80",
                "hover:from-primary/90 hover:to-primary/70",
                "disabled:from-gray-400 disabled:to-gray-400/80",
                "shadow-lg hover:shadow-xl disabled:shadow-none",
                "transition-all duration-300",
                "transform hover:scale-[1.02] active:scale-[0.98]",
              )}
            >
              {isUploading ? (
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <LoadingIcon className="w-5 h-5 mr-2 animate-spin" />
                  <span>Uploading... {Math.round(uploadProgress)}%</span>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <UploadIcon className="w-5 h-5 mr-2" />
                  <span>Upload from Link</span>
                </motion.div>
              )}
            </Button>
            {isUploading && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-primary/50 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
