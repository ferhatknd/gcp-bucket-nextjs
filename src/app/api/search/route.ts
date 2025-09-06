import { NextRequest, NextResponse } from "next/server";
import { fileCache } from "@/lib/fileCache";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.trim() === "") {
    return NextResponse.json({ results: [] });
  }

  try {
    const searchQuery = query.toLowerCase().trim();
    const results: Array<{
      name: string;
      path: string;
      isDirectory: boolean;
      size?: number;
      updatedAt?: string;
    }> = [];

    // Get all cached paths
    const cacheStats = fileCache.getStats();
    const allPaths = cacheStats.paths;

    for (const path of allPaths) {
      const items = fileCache.get(path);
      if (!items) continue;

      for (const item of items) {
        // Search in file/folder names
        if (item.name.toLowerCase().includes(searchQuery)) {
          results.push({
            name: item.name,
            path: path,
            isDirectory: item.isDirectory,
            size: item.size,
            updatedAt: item.updatedAt,
          });
        }
      }
    }

    // Sort results: directories first, then alphabetically
    results.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    // Limit results to avoid overwhelming the UI
    const limitedResults = results.slice(0, 100);

    return NextResponse.json({
      results: limitedResults,
      total: results.length,
      showing: limitedResults.length,
    });

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}