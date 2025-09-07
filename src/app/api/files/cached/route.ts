import { NextRequest, NextResponse } from "next/server";
import { fileCache } from "@/lib/fileCache";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") || "asc";
  const all = searchParams.get("all") === "true";

  try {
    // Get all cached files from all directories
    const cacheStats = fileCache.getStats();
    const allCachedFiles: Array<{
      name: string;
      size: number;
      updatedAt: string;
      fullPath: string;
    }> = [];

    // Get all cached directories and their files
    const allEntries = fileCache.getAllEntries();
    
    for (const [dirPath, items] of allEntries) {
      for (const item of items) {
        if (!item.isDirectory && item.size && item.updatedAt) {
          allCachedFiles.push({
            name: item.name,
            size: item.size,
            updatedAt: item.updatedAt,
            fullPath: item.fullPath,
          });
        }
      }
    }

    // Apply search filter
    const filteredFiles = allCachedFiles.filter((file) =>
      file.name.toLowerCase().includes(search.toLowerCase()) ||
      file.fullPath.toLowerCase().includes(search.toLowerCase())
    );

    // Sort the filtered files
    const sortedFiles = filteredFiles.sort((a, b) => {
      if (sort === "name") {
        return order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sort === "date") {
        return order === "asc"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sort === "size") {
        return order === "asc" ? a.size - b.size : b.size - a.size;
      }
      return 0;
    });

    const totalPages = all ? 1 : Math.ceil(sortedFiles.length / PAGE_SIZE);
    const paginatedFiles = all
      ? sortedFiles
      : sortedFiles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalSize = sortedFiles.reduce((acc, file) => acc + file.size, 0);

    return NextResponse.json({
      files: paginatedFiles.map(file => ({
        name: file.fullPath, // Use full path as name for admin panel
        updatedAt: file.updatedAt,
        size: file.size,
      })),
      totalPages,
      totalFiles: sortedFiles.length,
      totalSize,
      cached: true,
      cacheStats: {
        totalDirectories: cacheStats.totalEntries,
        cachedFiles: allCachedFiles.length,
      },
    });
  } catch (error) {
    console.error("Error fetching cached files:", error);
    return NextResponse.json(
      { error: "Error fetching cached files" },
      { status: 500 },
    );
  }
}