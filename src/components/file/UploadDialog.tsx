"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UploadIcon, FolderIcon, FileIcon, LoadingIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onUploadComplete: () => void;
}

export function UploadDialog({ isOpen, onClose, currentPath, onUploadComplete }: UploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      Array.from(selectedFiles).forEach((file) => {
        formData.append("files", file);
        // Preserve folder structure for directory uploads
        if (file.webkitRelativePath) {
          formData.append("filePaths", file.webkitRelativePath);
        } else {
          formData.append("filePaths", file.name);
        }
      });
      
      // Add current path for server to handle directory structure
      formData.append("path", currentPath);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return Math.min(prev + Math.random() * 15, 90);
        });
      }, 1000);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setUploadProgress(100);
      await response.json();
      
      toast.success(`Successfully uploaded ${Array.from(selectedFiles).length} file(s)`);
      onUploadComplete();
      onClose();
      setSelectedFiles(null);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${(error as Error).message}`);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const selectFiles = () => {
    fileInputRef.current?.click();
  };

  const selectFolder = () => {
    folderInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl border border-primary/20 shadow-2xl w-full max-w-md mx-4 p-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Upload Files</h2>
          <p className="text-sm text-muted-foreground">
            Upload to: <span className="font-mono text-primary">{currentPath}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={selectFiles}
              className="h-20 flex-col gap-2"
              disabled={uploading}
            >
              <FileIcon className="w-6 h-6" />
              <span className="text-sm">Select Files</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={selectFolder}
              className="h-20 flex-col gap-2"
              disabled={uploading}
            >
              <FolderIcon className="w-6 h-6" />
              <span className="text-sm">Select Folder</span>
            </Button>
          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/30 rounded-lg p-3"
            >
              <p className="text-sm font-medium mb-2">
                Selected {selectedFiles.length} file(s):
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="text-xs text-muted-foreground font-mono">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFiles || selectedFiles.length === 0}
              className="flex-1 relative"
            >
              {uploading ? (
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <LoadingIcon className="w-4 h-4 mr-2 animate-spin" />
                  <span>{Math.round(uploadProgress)}%</span>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  <span>Upload</span>
                </motion.div>
              )}
              
              {uploading && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-primary/50 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <input
          ref={folderInputRef}
          type="file"
          {...({ webkitdirectory: "" } as any)}
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </motion.div>
    </div>
  );
}