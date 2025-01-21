"use client";
import React, { useCallback, useEffect } from "react";
import { useFileManagement } from "@/hooks/useFileManagement";
import { formatFileSize } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AdminFileList } from "@/components/panel/AdminFileList";

export default function AdminFileManager() {
  const { files, totalFiles, totalSize, fetchFiles } = useFileManagement();
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardContent className="p-6">
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
        <div className="bg-primary/5 px-6 py-4 border-t border-primary/10">
          <div className="flex justify-between items-center text-sm text-primary">
            <span>Total Files: {totalFiles}</span>
            <span>Total Size: {formatFileSize(totalSize)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
