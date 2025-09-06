"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/SearchBar";
import { FolderIcon, FileIcon, ChevronRightIcon, HomeIcon, UploadIcon } from "@/components/ui/Icons";
import { UploadDialog } from "@/components/file/UploadDialog";
import { formatFileSize } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DirectoryItem {
  name: string;
  size?: number;
  updatedAt?: string;
  isDirectory: boolean;
  fullPath: string;
}

interface DirectoryBrowserProps {
  onCopyAction: (filename: string) => void;
  onDownloadAction: (filename: string) => void;
}

export function DirectoryBrowser({ onCopyAction, onDownloadAction }: DirectoryBrowserProps) {
  const [currentPath, setCurrentPath] = useState("dbf-extracted/");
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [allItems, setAllItems] = useState<DirectoryItem[]>([]);
  const [isCached, setIsCached] = useState(false);
  const [indexingStatus, setIndexingStatus] = useState<{
    inProgress: boolean;
    processed: number;
    total: number;
    currentPath: string;
  } | null>(null);

  const fetchDirectoryContents = async (path: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/directory?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      setAllItems(data.items || []);
      setIsCached(data.cached || false);
    } catch (error) {
      console.error('Error fetching directory contents:', error);
      setAllItems([]);
      setIsCached(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDirectoryContents(currentPath);
    setSearchTerm(""); // Clear search when changing directory
  }, [currentPath]);

  // Auto-start indexing on first load
  useEffect(() => {
    const startIndexing = async () => {
      try {
        const response = await fetch('/api/cache/bulk-index', { method: 'POST' });
        const data = await response.json();
        if (response.ok) {
          console.log('Background indexing started:', data.message);
        }
      } catch (error) {
        console.log('Indexing may already be running or completed');
      }
    };
    
    startIndexing();

    // Poll indexing status
    const pollStatus = () => {
      fetch('/api/cache/bulk-index')
        .then(res => res.json())
        .then(data => {
          if (data.inProgress) {
            setIndexingStatus(data.stats);
            setTimeout(pollStatus, 2000); // Poll every 2 seconds
          } else {
            setIndexingStatus(null);
          }
        })
        .catch(() => {
          setIndexingStatus(null);
        });
    };

    setTimeout(pollStatus, 1000); // Start polling after 1 second
  }, []);

  const handleItemClick = (item: DirectoryItem) => {
    if (item.isDirectory) {
      setCurrentPath(item.fullPath);
      setSearchTerm(""); // Clear search when navigating
    }
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      pathParts.pop();
      setCurrentPath(pathParts.join('/') + '/');
    }
  };

  const navigateToRoot = () => {
    setCurrentPath("dbf-extracted/");
    setSearchTerm("");
  };

  const getBreadcrumbs = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    breadcrumbs.push({ name: "DBF Files", path: "dbf-extracted/" });
    
    for (let i = 1; i < pathParts.length; i++) {
      const path = pathParts.slice(0, i + 1).join('/') + '/';
      const name = pathParts[i].replace(/[_-]/g, ' ');
      breadcrumbs.push({ name, path });
    }
    
    return breadcrumbs;
  };

  const filteredItems = allItems.filter(item => 
    searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-4 bg-card/30 rounded-lg border border-primary/10"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateToRoot}
          className="gap-2"
        >
          <HomeIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Root</span>
        </Button>

        {getBreadcrumbs().map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPath(crumb.path)}
              className={cn(
                "truncate max-w-32 sm:max-w-48",
                index === getBreadcrumbs().length - 1 && "text-primary font-medium"
              )}
            >
              {crumb.name}
            </Button>
          </React.Fragment>
        ))}
        
        <div className="ml-auto flex items-center gap-2">
          {indexingStatus && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Indexing... {indexingStatus.processed}/{indexingStatus.total}
              </span>
            </div>
          )}
          {isCached && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Cached
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadDialogOpen(true)}
            className="gap-2"
          >
            <UploadIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            searchTerm={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search in ${currentPath}...`}
          />
        </div>
        {currentPath !== "dbf-extracted/" && (
          <Button variant="outline" onClick={navigateUp} className="gap-2">
            <ChevronRightIcon className="w-4 h-4 rotate-180" />
            Up
          </Button>
        )}
      </div>

      {/* Directory Contents */}
      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-12"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-2"
          >
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground"
              >
                {searchTerm ? `No results found for "${searchTerm}"` : "No items in this directory"}
              </motion.div>
            ) : (
              filteredItems.map((item, index) => (
                <motion.div
                  key={item.fullPath}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group flex items-center gap-4 p-4 rounded-lg border border-primary/10",
                    "hover:border-primary/30 hover:bg-card/50 transition-all duration-200",
                    item.isDirectory ? "cursor-pointer" : "cursor-default"
                  )}
                  onClick={() => item.isDirectory && handleItemClick(item)}
                >
                  <div className="flex-shrink-0">
                    {item.isDirectory ? (
                      <FolderIcon className="w-6 h-6 text-primary" />
                    ) : (
                      <FileIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    {!item.isDirectory && item.size && (
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(item.size)}
                      </p>
                    )}
                  </div>

                  {item.isDirectory ? (
                    <ChevronRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const encodedPath = encodeURIComponent(item.fullPath).replace(/%2F/g, '/');
                          const publicUrl = `https://storage.googleapis.com/yillikplan-data/${encodedPath}`;
                          navigator.clipboard.writeText(publicUrl);
                        }}
                      >
                        Copy URL
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const encodedPath = encodeURIComponent(item.fullPath).replace(/%2F/g, '/');
                          const publicUrl = `https://storage.googleapis.com/yillikplan-data/${encodedPath}`;
                          window.open(publicUrl, '_blank');
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <UploadDialog
        isOpen={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        currentPath={currentPath}
        onUploadComplete={() => {
          fetchDirectoryContents(currentPath);
        }}
      />
    </div>
  );
}