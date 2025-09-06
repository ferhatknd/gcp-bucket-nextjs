import { NextRequest, NextResponse } from "next/server";
import { cloudStorage } from "@/lib/cloudStorage";
import { fileCache } from "@/lib/fileCache";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path") || "dbf-extracted/";

  try {
    // Check cache first
    const cachedItems = fileCache.get(path);
    if (cachedItems) {
      console.log(`Cache hit for ${path}`);
      return NextResponse.json({
        currentPath: path,
        items: cachedItems,
        totalItems: cachedItems.length,
        cached: true
      });
    }

    console.log(`Cache miss for ${path}, fetching from GCS...`);
    
    // Get files and subdirectories for the current path
    const [files, , apiResponse] = await cloudStorage.listFiles(path, true); // true for delimiter
    const subdirectories = (apiResponse as any)?.prefixes || [];

    const items: Array<{
      name: string;
      size?: number;
      updatedAt?: string;
      isDirectory: boolean;
      fullPath: string;
    }> = [];

    // Add subdirectories
    for (const dirPrefix of subdirectories) {
      const dirName = dirPrefix.slice(path.length).replace(/\/$/, '');
      if (dirName) {
        items.push({
          name: dirName,
          isDirectory: true,
          fullPath: dirPrefix,
        });
      }
    }

    // Add files in current directory
    for (const file of files) {
      const fileName = file.name;
      const relativeName = fileName.slice(path.length);
      
      // Skip if this file is in a subdirectory
      if (relativeName.includes('/') || !relativeName) continue;
      
      const metadata = await cloudStorage.getFileMetadata(fileName);
      items.push({
        name: relativeName,
        size: parseInt(String(metadata.size) || "0", 10),
        updatedAt: metadata.updated,
        isDirectory: false,
        fullPath: fileName,
      });
    }

    // Sort items: directories first, then files, both alphabetically
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    // Cache the results
    fileCache.set(path, items);
    console.log(`Cached ${items.length} items for ${path}`);

    return NextResponse.json({
      currentPath: path,
      items,
      totalItems: items.length,
      cached: false
    });
  } catch (error) {
    console.error("Error fetching directory contents:", error);
    return NextResponse.json(
      { error: "Failed to fetch directory contents" },
      { status: 500 }
    );
  }
}