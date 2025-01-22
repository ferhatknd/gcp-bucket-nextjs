"use client";
import React, { JSX, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatFileSize } from "@/lib/utils";
import { useFileManagement } from "@/hooks/useFileManagement";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import {
  FileIcon,
  FileStatsIcon,
  TrashIcon,
  RenameIcon,
  RefreshIcon,
  SortIcon,
  ClockIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

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
}

export function AdminFileList({ files, onRefreshAction }: FileListProps) {
  const { sortState, updateSort } = useFileManagement();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState("");
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [fileToRename, setFileToRename] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [adminApiKey, setAdminApiKey] = useState("");

  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

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

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString().slice(0, -3).replace(":", ".")
    );
  }

  const SortButton = ({
    onClick,
    active,
    icon,
    label,
  }: {
    onClick: () => void;
    active: boolean;
    icon: JSX.Element;
    label: string;
  }) => (
    <Button
      onClick={onClick}
      variant={active ? "default" : "outline"}
      size="sm"
      className={buttonClasses}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Button>
  );

  const FileActionButton = ({
    variant,
    onClick,
    disabled,
    icon,
    label,
  }: {
    variant:
      | "link"
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | null
      | undefined;
    onClick: () => void;
    disabled: boolean;
    icon: JSX.Element;
    label: string;
  }) => (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Button>
  );

  const handleDelete = async (filename: string) => {
    setFileToDelete(filename);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    if (!adminApiKey) {
      toast.error("Admin API key is required");
      return;
    }
    try {
      const response = await fetch(
        `/api/delete?filename=${encodeURIComponent(fileToDelete)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminApiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      toast.success("File deleted successfully");
      onRefreshAction();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file. Please try again.");
    }
    setFileToDelete("");
  };

  const handleRename = (filename: string) => {
    setFileToRename(filename);
    setNewFileName(filename);
    setShowRenameDialog(true);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFileName) {
      toast.error("New file name is required");
      return;
    }

    if (!adminApiKey) {
      toast.error("Admin API key is required");
      return;
    }

    try {
      const response = await fetch("/api/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminApiKey}`,
        },
        body: JSON.stringify({
          oldFilename: fileToRename,
          newFilename: newFileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename file");
      }

      toast.success("File renamed successfully");
      onRefreshAction();
      setShowRenameDialog(false);
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Failed to rename file. Please try again.");
    }

    setShowRenameDialog(false);
    setFileToRename("");
    setNewFileName("");
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefreshAction();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="relative bg-card rounded-xl p-4 sm:p-6 shadow-xl border border-primary/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Files Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your uploaded files
              </p>
            </motion.div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto group transition-all duration-300 hover:border-primary/50"
              disabled={isLoading}
            >
              <RefreshIcon
                className={cn(
                  "w-4 h-4 mr-2 transition-transform duration-500",
                  isLoading ? "animate-spin" : "group-hover:rotate-180",
                )}
              />
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {(["name", "date", "size"] as const).map((type) => (
              <Button
                key={type}
                onClick={() => updateSort(type)}
                variant={sortState.by === type ? "default" : "outline"}
                size="sm"
                className={cn(
                  "transition-all duration-300 w-full sm:w-auto",
                  sortState.by === type
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "hover:border-primary/50",
                )}
              >
                <SortIcon
                  className={cn(
                    "w-4 h-4 mr-2 transition-transform duration-300",
                    sortState.by === type &&
                      sortState.orders[type] === "desc" &&
                      "rotate-180",
                  )}
                  type={type}
                  order={sortState.orders[type]}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <LoadingIndicator loading="files" />
          </motion.div>
        ) : (
          <div className="grid gap-2 md:gap-4">
            {sortedFiles.map((file, index) => (
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
                      <FileIcon className="w-5 h-5 md:w-10 md:h-10 text-primary" />
                    </motion.div>

                    <div className="flex-grow min-w-0 space-y-0.5 md:space-y-1 max-w-full">
                      <Link href={`/files/${encodeURIComponent(file.name)}`}>
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
                      onClick={() => handleRename(file.name)}
                      variant="outline"
                      size="default"
                      className="flex-1 text-[10px] md:text-base h-7 md:h-10 px-2 md:px-6 transition-all duration-300 hover:border-primary/50"
                    >
                      <RenameIcon className="w-4 h-4 md:w-4 md:h-4 mr-1 md:mr-2" />
                      Rename
                    </Button>
                    <Button
                      onClick={() => handleDelete(file.name)}
                      variant="destructive"
                      size="default"
                      className="flex-1 text-[10px] md:text-base h-7 md:h-10 px-2 md:px-6 transition-all duration-300"
                    >
                      <TrashIcon className="w-4 h-4 md:w-4 md:h-4 mr-1 md:mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {fileToDelete}
              </span>
              ? This action cannot be undone.
            </p>
            <Input
              type="password"
              value={adminApiKey}
              onChange={(e) => setAdminApiKey(e.target.value)}
              placeholder="Enter Admin API Key"
              className="h-11"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="w-full sm:w-auto transition-all duration-300 hover:border-primary/50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="w-full sm:w-auto transition-all duration-300"
            >
              Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Rename File
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRenameSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newFileName">New Filename</Label>
              <Input
                id="newFileName"
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminApiKey">Admin API Key</Label>
              <Input
                id="adminApiKey"
                type="password"
                value={adminApiKey}
                onChange={(e) => setAdminApiKey(e.target.value)}
                placeholder="Enter Admin API Key"
                className="h-11"
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRenameDialog(false);
                  setNewFileName("");
                }}
                className="w-full sm:w-auto transition-all duration-300 hover:border-primary/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto transition-all duration-300 hover:bg-primary/90"
              >
                Rename File
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
