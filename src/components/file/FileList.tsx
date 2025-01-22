"use client";
import React, { useState, useCallback, useMemo, JSX } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { formatFileSize } from "@/lib/utils";
import { useFileManagement } from "@/hooks/useFileManagement";
import {
  getFileIcon,
  RefreshIcon,
  CopyIcon,
  DownloadIcon,
  FileStatsIcon,
  SortIcon,
  AllFilesIcon,
  CheckIcon,
  ClockIcon,
  LoadingIcon,
} from "@/components/ui/Icons";
import { FilesSkeleton } from "../ui/FilesSkeleton";
import { cn } from "@/lib/utils";

interface File {
  name: string;
  updatedAt: string;
  size: number;
}

interface FileListProps {
  files: File[];
  onCopyAction: (filename: string) => void;
  onDownloadAction: (filename: string) => void;
  onRefreshAction: () => Promise<void>;
  totalFiles: number;
  totalSize: number;
  loading?: boolean;
}

export function FileList({
  files,
  onCopyAction,
  onDownloadAction,
  onRefreshAction,
  totalFiles,
  totalSize,
  loading = false,
}: FileListProps) {
  const { sortState, updateSort } = useFileManagement();
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [downloadingStates, setDownloadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentRoute = pathname.split("?")[0];

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      const order = sortState.orders[sortState.by];
      if (sortState.by === "name") {
        return order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortState.by === "date") {
        return order === "asc"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortState.by === "size") {
        return order === "asc" ? a.size - b.size : b.size - a.size;
      }
      return 0;
    });
  }, [files, sortState]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshAction();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleCopy = useCallback(
    (filename: string) => {
      onCopyAction(filename);
      setCopiedStates((prev) => ({ ...prev, [filename]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [filename]: false }));
      }, 2000);
    },
    [onCopyAction],
  );

  const handleDownload = useCallback(
    (filename: string) => {
      onDownloadAction(filename);
      setDownloadingStates((prev) => ({ ...prev, [filename]: true }));
      setTimeout(() => {
        setDownloadingStates((prev) => ({ ...prev, [filename]: false }));
      }, 2000);
    },
    [onDownloadAction],
  );

  if (loading) return <FilesSkeleton />;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/2 rounded-2xl blur-sm" />
        <div className="relative bg-card rounded-2xl p-3 md:p-6 shadow-xl border border-primary/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
            <div className="space-y-1 w-full sm:w-auto">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
              >
                Files
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs md:text-sm text-muted-foreground"
              >
                Total: {totalFiles} files ({formatFileSize(totalSize)})
              </motion.p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className={cn(
                  "group transition-all duration-300 hover:border-primary/50 w-full sm:w-auto text-xs md:text-sm",
                  isRefreshing && "opacity-50 cursor-not-allowed",
                )}
              >
                <RefreshIcon
                  className={cn(
                    "w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 transition-transform duration-500",
                    isRefreshing ? "animate-spin" : "group-hover:rotate-180",
                  )}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>

              {currentRoute !== "/files" && (
                <Button
                  onClick={() => router.push("/files")}
                  variant="outline"
                  size="sm"
                  className="group transition-all duration-300 hover:border-primary/50 w-full sm:w-auto text-xs md:text-sm"
                >
                  <AllFilesIcon className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 transition-transform duration-300 group-hover:scale-110" />
                  View All
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-row flex-nowrap justify-start gap-2 mb-4 md:mb-6">
            {(["name", "date", "size"] as const).map((type) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: type === "name" ? 0.1 : type === "date" ? 0.2 : 0.3,
                }}
                className="flex-1 md:flex-none"
              >
                <Button
                  onClick={() => updateSort(type)}
                  variant={sortState.by === type ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "transition-all duration-300 w-full text-xs md:text-sm min-w-0 md:min-w-[100px]",
                    sortState.by === type
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "hover:border-primary/50",
                  )}
                >
                  <SortIcon
                    className={cn(
                      "w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 transition-transform duration-300",
                      sortState.by === type &&
                        sortState.orders[type] === "desc" &&
                        "rotate-180",
                    )}
                    type={type}
                    order={sortState.orders[type]}
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            <div className="grid gap-2 md:gap-4">
              {sortedFiles.map((file, index) => {
                const isCopied = copiedStates[file.name];
                const isDownloading = downloadingStates[file.name];
                const FileTypeIcon = getFileIcon(file.name);

                return (
                  <motion.div
                    key={file.name}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      "group relative bg-card rounded-lg p-2 md:p-5",
                      "border border-primary/10 hover:border-primary/30",
                      "shadow-md hover:shadow-lg",
                      "transition-all duration-300",
                      "overflow-hidden",
                    )}
                  >
                    <div className="flex flex-col gap-2 md:gap-4">
                      <div className="flex flex-row items-start gap-2 md:gap-4 w-full">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="p-1.5 md:p-2 bg-primary/5 rounded-lg transition-colors duration-300 group-hover:bg-primary/10 shrink-0"
                        >
                          <FileTypeIcon className="w-5 h-5 md:w-10 md:h-10 text-primary" />
                        </motion.div>

                        <div className="flex-grow min-w-0 space-y-0.5 md:space-y-1 max-w-full">
                          <Link
                            href={`/files/${encodeURIComponent(file.name)}`}
                            className="block"
                          >
                            <h3 className="font-medium text-xs md:text-lg hover:text-primary transition-colors duration-300 truncate pr-2">
                              {file.name}
                            </h3>
                          </Link>

                          <div className="flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-1 text-[10px] md:text-sm text-muted-foreground">
                            <span className="flex items-center whitespace-nowrap">
                              <FileStatsIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                              {formatFileSize(file.size)}
                            </span>
                            <span className="flex items-center whitespace-nowrap">
                              <ClockIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                              {formatDate(file.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button
                          onClick={() => handleCopy(file.name)}
                          variant={isCopied ? "default" : "outline"}
                          size="default"
                          className={cn(
                            "transition-all duration-300 flex-1 text-[10px] md:text-base h-7 md:h-10 px-2 md:px-6",
                            isCopied
                              ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                              : "hover:border-primary/50",
                          )}
                          disabled={isCopied}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={isCopied ? "check" : "copy"}
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              className="flex items-center"
                            >
                              {isCopied ? (
                                <>
                                  <CheckIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <CopyIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                  Copy Link
                                </>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </Button>

                        <Button
                          onClick={() => handleDownload(file.name)}
                          variant="outline"
                          size="default"
                          className={cn(
                            "transition-all duration-300 hover:border-primary/50 flex-1 text-[10px] md:text-base h-7 md:h-10 px-2 md:px-6",
                            isDownloading && "opacity-50",
                          )}
                          disabled={isDownloading}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={isDownloading ? "downloading" : "download"}
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              className="flex items-center"
                            >
                              {isDownloading ? (
                                <>
                                  <LoadingIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <DownloadIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                  Download
                                </>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
