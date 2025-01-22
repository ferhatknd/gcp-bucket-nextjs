"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useFileManagement } from "@/hooks/useFileManagement";
import { SearchBar } from "@/components/ui/SearchBar";
import { FileContent } from "@/components/file/FileManager";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import { HomeIcon, FileStatsIcon, DatabaseIcon } from "@/components/ui/Icons";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { formatFileSize, cn } from "@/lib/utils";

const FilesPage = () => {
  const {
    files,
    loading,
    initialLoadDone,
    fetchFiles,
    handleCopy,
    handleDownload,
    totalFiles,
    totalSize,
    setDisabledPagination,
    searchTerm,
    handleSearch,
  } = useFileManagement(true);
  const router = useRouter();

  useEffect(() => {
    setDisabledPagination(true);
    fetchFiles();
  }, [fetchFiles, setDisabledPagination]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80"
    >
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 border-b border-primary/10 bg-gradient-to-b from-background/80 to-background/20 backdrop-blur-xl"
      >
        <div className="container mx-auto px-2 sm:px-4 h-16">
          <div className="flex h-full items-center justify-between">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className="group flex items-center gap-2 px-2 sm:px-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary relative transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-sm sm:text-base">
                  Home
                </span>
              </Button>
            </motion.div>
            <ThemeSwitch />
          </div>
        </div>
      </motion.header>

      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[hsl(var(--gradient-1))] via-[hsl(var(--gradient-2))] to-[hsl(var(--gradient-3))] bg-clip-text text-transparent"
              >
                File Manager
              </motion.h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className="bg-card/50 backdrop-blur-sm text-xs sm:text-sm"
              >
                <FileStatsIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                {totalFiles} files
              </Badge>
              <Badge
                variant="outline"
                className="bg-card/50 backdrop-blur-sm text-xs sm:text-sm"
              >
                <DatabaseIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                {formatFileSize(totalSize)}
              </Badge>
            </div>
          </div>

          <SearchBar
            searchTerm={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="relative bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10 shadow-lg overflow-hidden">
            <div className="p-2 sm:p-4 md:p-6">
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
                onRefreshAction={fetchFiles}
                totalFiles={totalFiles}
                totalSize={totalSize}
              />
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default FilesPage;
