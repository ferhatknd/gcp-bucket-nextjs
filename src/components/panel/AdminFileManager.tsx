"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useFileManagement } from "@/hooks/useFileManagement";
import { formatFileSize } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AdminFileList } from "@/components/panel/AdminFileList";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { motion } from "framer-motion";

export default function AdminFileManager() {
  const { files, totalFiles, totalSize, fetchFiles } = useFileManagement();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      await fetchFiles();
      setIsInitialLoading(false);
    };
    loadFiles();
  }, [fetchFiles]);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIndicator loading="files" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 md:py-12 lg:py-16"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/2 rounded-lg sm:rounded-xl md:rounded-2xl blur-sm" />
        <Card className="relative bg-card/60 backdrop-blur-sm border border-primary/20 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/30">
          <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
            <AdminFileList
              files={files.map((file) => ({
                name: file.name,
                updatedAt: file.updatedAt,
                size: file.size || 0,
              }))}
              onCopyAction={() => {}}
              onDownloadAction={() => {}}
              onRefreshAction={handleRefresh}
              totalFiles={totalFiles}
              totalSize={totalSize}
            />
          </CardContent>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-primary/10 backdrop-blur-sm px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-4 md:py-5 border-t border-primary/20"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <span className="text-sm sm:text-base font-medium text-foreground/80 hover:text-foreground transition-colors">
                Total Files: {totalFiles}
              </span>
              <span className="text-sm sm:text-base font-medium text-foreground/80 hover:text-foreground transition-colors">
                Total Size: {formatFileSize(totalSize)}
              </span>
            </div>
          </motion.div>
        </Card>
      </div>
    </motion.div>
  );
}
