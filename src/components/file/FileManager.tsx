"use client";
import React, { useEffect, useCallback } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { useFileManagement } from "@/hooks/useFileManagement";
import { toast } from "react-hot-toast";
import { FileUploader } from "@/components/file/FileUploader";
import { FileList } from "@/components/file/FileList";

interface FileData {
  name: string;
  updatedAt: string;
  size?: number;
}

export function FileManager() {
  const {
    files,
    searchTerm,
    currentPage,
    totalPages,
    loading,
    initialLoadDone,
    fetchFiles,
    handleSearch,
    handleCopy,
    handleDownload,
    setCurrentPage,
    totalFiles,
    totalSize,
  } = useFileManagement(false);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  const handleUploadComplete = useCallback(() => {
    handleRefresh();
    toast.success("Upload completed successfully!", {
      duration: 3000,
      position: "top-right",
    });
  }, [handleRefresh]);

  return (
    <section className="mb-8">
      <FileUploader onUploadCompleteAction={handleUploadComplete} />
      <>
        <h2 className="text-2xl font-bold mb-4">Download Files</h2>
        <div className="bg-muted rounded-lg p-6">
          <SearchBar
            searchTerm={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <FileContent
            loading={loading}
            initialLoadDone={initialLoadDone}
            files={files.map((file) => ({
              ...file,
              name: file.name,
              updatedAt: file.updatedAt,
              size: file.size || 0,
            }))}
            onCopyAction={handleCopy}
            onDownloadAction={handleDownload}
            onRefreshAction={handleRefresh}
            totalFiles={totalFiles}
            totalSize={totalSize}
          />
          {!loading && initialLoadDone && files.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </>
    </section>
  );
}

interface FileContentProps {
  loading: boolean;
  initialLoadDone: boolean;
  files: FileData[];
  onCopyAction: (filename: string) => void;
  onDownloadAction: (filename: string) => void;
  onRefreshAction: () => Promise<void>;
  totalFiles: number;
  totalSize: number;
}

export function FileContent({
  loading,
  initialLoadDone,
  files,
  onCopyAction,
  onDownloadAction,
  onRefreshAction,
  totalFiles,
  totalSize,
}: FileContentProps) {
  if (!initialLoadDone) return null;
  if (files.length === 0)
    return <p className="text-gray-500">No files found.</p>;

  return (
    <FileList
      files={files.map((file) => ({
        name: file.name,
        updatedAt: file.updatedAt,
        size: file.size || 0,
      }))}
      onCopyAction={onCopyAction}
      onDownloadAction={onDownloadAction}
      onRefreshAction={onRefreshAction}
      totalFiles={totalFiles}
      totalSize={totalSize}
    />
  );
}
