"use client";
import React, { useEffect, useCallback, useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { useFileManagement } from "@/hooks/useFileManagement";
import { toast, Toast } from "react-hot-toast";
import { FileUploader } from "@/components/file/FileUploader";
import { KernelUploader, KernelUploadResponse } from "./KernelUploader";
import {
  FileStatsIcon,
  DatabaseIcon,
  FileIcon,
  XIcon,
  CheckIcon,
} from "@/components/ui/Icons";
import { formatFileSize } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StatsCard } from "@/components/ui/statscard";
import { FilesSkeleton } from "@/components/ui/FilesSkeleton";
import { cn } from "@/lib/utils";
import { FolderView } from "@/components/file/FolderView";
import { FileCategory } from "@/types/filetypes";

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

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFolder, setActiveFolder] = useState<FileCategory | null>(null);

  useEffect(() => {
    const initialLoad = async () => {
      await fetchFiles();
    };
    initialLoad();
  }, [fetchFiles]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchFiles();
    setIsRefreshing(false);
  }, [fetchFiles]);

  const handleKernelUpload = useCallback(
    (response: KernelUploadResponse) => {
      handleRefresh();
      toast.custom((t: Toast) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "pointer-events-auto flex w-full max-w-[90vw] sm:max-w-xl rounded-lg",
            "bg-card border border-primary/10",
            "shadow-lg",
            t.visible ? "animate-in" : "animate-out",
          )}
        >
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Kernel Upload Successful</p>
                <p className="mt-1 text-sm text-muted-foreground truncate">
                  {response.kernel.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Checksum: {response.kernel.checksum}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => toast.dismiss(t.id)}
              className={cn(
                "flex items-center justify-center w-12 h-full",
                "hover:bg-primary/5 transition-colors duration-200",
                "border-l border-primary/10",
              )}
            >
              <XIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      ));
    },
    [handleRefresh],
  );

  const handleUploadComplete = useCallback(
    (file: { name: string; url: string }) => {
      handleRefresh();
      toast.custom((t: { visible: boolean; id: string }) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            "pointer-events-auto flex w-full max-w-[90vw] sm:max-w-xl rounded-lg",
            "bg-card border border-primary/10",
            "shadow-lg",
            t.visible ? "animate-in" : "animate-out",
          )}
        >
          <div className="flex-1 p-4 min-w-0">
            {" "}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                {" "}
                <p className="text-sm font-medium">Upload Successful</p>
                <p className="mt-1 text-sm text-muted-foreground truncate">
                  {file.name}
                </p>
                <div className="hidden group-hover:block absolute left-0 right-0 mt-1 p-2 bg-popover rounded-md shadow-lg">
                  <p className="text-sm break-all">{file.name}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {" "}
            <button
              onClick={() => toast.dismiss(t.id)}
              className={cn(
                "flex items-center justify-center w-12 h-full",
                "hover:bg-primary/5 transition-colors duration-200",
                "border-l border-primary/10",
              )}
            >
              <XIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      ));
    },
    [handleRefresh],
  );

  return (
    <section className="relative space-y-4 md:space-y-8">
      <div className="absolute inset-0 bg-background pointer-events-none rounded-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-primary/10 overflow-hidden"
      >
        <FileUploader onUploadCompleteAction={handleUploadComplete} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-primary/10 overflow-hidden"
      >
        <KernelUploader onUploadComplete={handleKernelUpload} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="relative rounded-2xl border border-primary/10 overflow-hidden bg-card p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 mb-4 md:mb-6">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            >
              Download Files
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
            >
              <StatsCard
                icon={FileStatsIcon}
                label="Total Files"
                value={totalFiles.toString()}
              />
              <StatsCard
                icon={DatabaseIcon}
                label="Total Size"
                value={formatFileSize(totalSize)}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/2 rounded-2xl blur-sm" />
            <div className="relative bg-card rounded-2xl border border-primary/10 shadow-xl overflow-hidden">
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <SearchBar
                      searchTerm={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <FilesSkeleton />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
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
                        activeFolder={activeFolder}
                        setActiveFolderAction={setActiveFolder}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {!loading && initialLoadDone && files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
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
  activeFolder: FileCategory | null;
  setActiveFolderAction: (folder: FileCategory | null) => void;
}

export function FileContent({
  loading,
  initialLoadDone,
  files,
  onCopyAction,
  onDownloadAction,
  onRefreshAction,
  activeFolder,
  setActiveFolderAction,
}: FileContentProps) {
  if (!initialLoadDone) return null;

  if (files.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 space-y-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="p-4 rounded-full bg-primary/5"
        >
          <FileIcon className="w-8 h-8 text-primary/60" />
        </motion.div>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-center"
        >
          No files found
        </motion.p>
      </motion.div>
    );
  }

  return (
    <FolderView
      loading={loading}
      files={files.map((file) => ({
        name: file.name,
        updatedAt: file.updatedAt,
        size: file.size || 0,
      }))}
      onCopyAction={onCopyAction}
      onDownloadAction={onDownloadAction}
      onRefreshAction={onRefreshAction}
      activeFolder={activeFolder}
      setActiveFolder={setActiveFolderAction}
    />
  );
}
