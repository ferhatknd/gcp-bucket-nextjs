import { formatFileSize } from "@/lib/utils";
import { motion } from "framer-motion";
import { DatabaseIcon, FileStatsIcon } from "@/components/ui/Icons";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface StorageStatsProps {
  totalSize: number;
  totalFiles: number;
}

export function StorageStats({ totalSize, totalFiles }: StorageStatsProps) {
  const maxStorage = 1024 * 1024 * 1024 * 1024; // 1TB in bytes
  const usagePercentage = (totalSize / maxStorage) * 100;
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingStatus, setIndexingStatus] = useState<any>(null);

  const handleBulkIndex = async () => {
    setIsIndexing(true);
    try {
      const response = await fetch('/api/cache/bulk-index', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Bulk indexing started successfully!');
        
        // Start polling for status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch('/api/cache/bulk-index');
            const statusData = await statusResponse.json();
            setIndexingStatus(statusData);
            
            if (!statusData.inProgress) {
              clearInterval(pollInterval);
              setIsIndexing(false);
              toast.success('Bulk indexing completed!');
            }
          } catch (error) {
            clearInterval(pollInterval);
            setIsIndexing(false);
          }
        }, 2000);
      } else {
        toast.error('Failed to start bulk indexing');
        setIsIndexing(false);
      }
    } catch (error) {
      toast.error('Error starting bulk indexing');
      setIsIndexing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Storage Overview
        </h3>

        <div className="flex justify-between items-center mb-4">
          <div>
            {isIndexing && indexingStatus && (
              <div className="text-sm text-muted-foreground">
                Progress: {indexingStatus.stats?.processed || 0} / {indexingStatus.stats?.total || 0} directories
              </div>
            )}
          </div>
          <Button 
            onClick={handleBulkIndex} 
            disabled={isIndexing}
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
          >
            {isIndexing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Indexing...
              </>
            ) : (
              'Start Bulk Index'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10 p-4 overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DatabaseIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="font-medium">{formatFileSize(totalSize)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative h-2 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercentage}%` }}
                  transition={{
                    duration: 1,
                    ease: "easeOut",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(totalSize)} used</span>
                <span>{formatFileSize(maxStorage)} total</span>
              </div>
            </div>
          </div>

          <div className="relative bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileStatsIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="font-medium">{totalFiles.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs text-muted-foreground">
                Average file size:{" "}
                <span className="font-medium">
                  {formatFileSize(totalFiles > 0 ? totalSize / totalFiles : 0)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
