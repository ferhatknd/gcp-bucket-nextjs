import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileList } from "@/components/file/FileList";
import { FileCategory } from "@/types/filetypes";
import {
  KernelIcon,
  ArchiveIcon,
  FolderIcon,
  ChevronRightIcon,
  DatabaseIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

interface FolderViewProps {
  files: Array<{
    name: string;
    size: number;
    updatedAt: string;
  }>;
  dbfExtractedFiles: Array<{
    name: string;
    size: number;
    updatedAt: string;
  }>;
  onCopyAction: (filename: string) => void;
  onDownloadAction: (filename: string) => void;
  onRefreshAction: () => Promise<void>;
  loading?: boolean;
  activeFolder: FileCategory | null;
  setActiveFolder: (folder: FileCategory | null) => void;
}

export function FolderView({
  files,
  dbfExtractedFiles,
  onCopyAction,
  onDownloadAction,
  onRefreshAction,
  loading = false,
  activeFolder,
  setActiveFolder,
}: FolderViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9; // Define page size

  const kernelFiles = files.filter((file) => file.size < 512 * 1024 * 1024);
  const romFiles = files.filter((file) => file.size >= 512 * 1024 * 1024);

  const folders = [
    {
      category: FileCategory.KERNEL,
      label: "Kernels",
      icon: KernelIcon,
      count: kernelFiles.length,
      files: kernelFiles,
    },
    {
      category: FileCategory.ROM,
      label: "ROMs",
      icon: ArchiveIcon,
      count: romFiles.length,
      files: romFiles,
    },
    {
      category: FileCategory.DBF_EXTRACTED,
      label: "DBF Extracted Files",
      icon: DatabaseIcon,
      count: dbfExtractedFiles.length,
      files: dbfExtractedFiles,
    },
  ];

  const currentFolder = folders.find((f) => f.category === activeFolder);

  const indexOfLastFile = currentPage * PAGE_SIZE;
  const indexOfFirstFile = indexOfLastFile - PAGE_SIZE;
  const currentFiles = currentFolder
    ? currentFolder.files.slice(indexOfFirstFile, indexOfLastFile)
    : [];
  const totalPages = currentFolder
    ? Math.ceil(currentFolder.files.length / PAGE_SIZE)
    : 1;

  // Reset pagination when changing folders
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFolder]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!activeFolder ? (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {folders.map((folder, index) => (
              <motion.div
                key={folder.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: index * 0.1,
                    duration: 0.4,
                  },
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "group cursor-pointer",
                  "bg-card/50 backdrop-blur-sm rounded-xl",
                  "border border-primary/10",
                  "transition-all duration-300",
                  "hover:border-primary/30 hover:shadow-lg",
                )}
                onClick={() => setActiveFolder(folder.category)}
              >
                <div className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <folder.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{folder.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {folder.count} files
                    </p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors duration-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setActiveFolder(null)}
                className="group gap-2"
              >
                <FolderIcon className="w-5 h-5" />
                <span>Back to Folders</span>
              </Button>
            </motion.div>

            <FileList
              files={currentFiles}
              onCopyAction={onCopyAction}
              onDownloadAction={onDownloadAction}
              onRefreshAction={onRefreshAction}
              loading={loading}
              totalFiles={currentFolder?.count || 0}
              totalSize={
                currentFolder?.files.reduce(
                  (acc, file) => acc + file.size,
                  0,
                ) || 0
              }
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              showPagination={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
