import { NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";
import { fileCache, CachedFile } from "@/lib/fileCache";

let indexingInProgress = false;
let indexingStats = {
  total: 0,
  processed: 0,
  startTime: 0,
  currentPath: "",
};

export async function POST() {
  if (indexingInProgress) {
    return NextResponse.json({ 
      error: "Indexing already in progress",
      stats: indexingStats
    }, { status: 409 });
  }

  // Start background indexing
  indexingInProgress = true;
  indexingStats = {
    total: 0,
    processed: 0,
    startTime: Date.now(),
    currentPath: "Starting...",
  };

  // Don't await this - let it run in background
  performBulkIndexing().finally(() => {
    indexingInProgress = false;
  });

  return NextResponse.json({ 
    message: "Bulk indexing started",
    stats: indexingStats
  });
}

export async function GET() {
  return NextResponse.json({
    inProgress: indexingInProgress,
    stats: indexingStats,
    cache: fileCache.getStats()
  });
}

async function performBulkIndexing() {
  try {
    console.log("Starting bulk indexing...");
    
    // Get all directories first
    const allDirectories = await getAllDirectories();
    indexingStats.total = allDirectories.length;
    
    console.log(`Found ${allDirectories.length} directories to index`);

    // Index each directory
    for (const dirPath of allDirectories) {
      if (!fileCache.isValid(dirPath)) {
        indexingStats.currentPath = dirPath;
        await indexDirectory(dirPath);
        indexingStats.processed++;
        
        console.log(`Indexed ${dirPath} (${indexingStats.processed}/${indexingStats.total})`);
      }
    }

    const duration = Date.now() - indexingStats.startTime;
    console.log(`Bulk indexing completed in ${duration}ms. Indexed ${indexingStats.processed} directories.`);
    
  } catch (error) {
    console.error("Error during bulk indexing:", error);
  }
}

async function getAllDirectories(): Promise<string[]> {
  const directories: string[] = [];
  const visited = new Set<string>();
  
  async function exploreDirectory(path: string) {
    if (visited.has(path)) return;
    visited.add(path);
    
    try {
      const [files, , apiResponse] = await cloudStorage.listFiles(path, true);
      const subdirectories = (apiResponse as any)?.prefixes || [];
      
      directories.push(path);
      
      // Recursively explore subdirectories
      for (const subdir of subdirectories) {
        await exploreDirectory(subdir);
      }
    } catch (error) {
      console.error(`Error exploring ${path}:`, error);
    }
  }
  
  await exploreDirectory('dbf-extracted/');
  return directories;
}

async function indexDirectory(path: string) {
  try {
    const [files, , apiResponse] = await cloudStorage.listFiles(path, true);
    const subdirectories = (apiResponse as any)?.prefixes || [];

    const items: CachedFile[] = [];

    // Add subdirectories
    for (const dirPrefix of subdirectories) {
      const dirName = dirPrefix.slice(path.length).replace(/\/$/, '');
      if (dirName) {
        items.push({
          name: dirName,
          isDirectory: true,
          fullPath: dirPrefix,
          cachedAt: Date.now(),
        });
      }
    }

    // Add files in current directory
    for (const file of files) {
      const fileName = file.name;
      const relativeName = fileName.slice(path.length);
      
      if (relativeName.includes('/') || !relativeName) continue;
      
      const metadata = await cloudStorage.getFileMetadata(fileName);
      items.push({
        name: relativeName,
        size: parseInt(String(metadata.size) || "0", 10),
        updatedAt: metadata.updated,
        isDirectory: false,
        fullPath: fileName,
        cachedAt: Date.now(),
      });
    }

    // Sort items
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    fileCache.set(path, items);
  } catch (error) {
    console.error(`Error indexing directory ${path}:`, error);
  }
}