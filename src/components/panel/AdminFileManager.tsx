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
      className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/2 rounded-lg sm:rounded-xl md:rounded-2xl" />
        <Card className="relative bg-card/50 border border-primary/10 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-primary/5 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 md:py-4 border-t border-primary/10"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <span className="text-xs sm:text-sm font-medium">
                Total Files: {totalFiles}
              </span>
              <span className="text-xs sm:text-sm font-medium">
                Total Size: {formatFileSize(totalSize)}
              </span>
            </div>
          </motion.div>
        </Card>
      </div>
    </motion.div>
  );
}
