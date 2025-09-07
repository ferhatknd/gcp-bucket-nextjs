import { NextRequest, NextResponse } from "next/server";
import { fileCache } from "@/lib/fileCache";
import Fuse from 'fuse.js';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const currentPath = searchParams.get("currentPath") || "";

  if (!query || query.trim() === "") {
    return NextResponse.json({ results: [] });
  }

  try {
    // Get all files from cache for the current path and subdirectories
    const cacheStats = fileCache.getStats();
    const allPaths = cacheStats.paths.filter(path => path.startsWith(currentPath));

    // Collect all items into a single array for Fuse.js
    const allItems: Array<{
      name: string;
      path: string;
      isDirectory: boolean;
      size?: number;
      updatedAt?: string;
      fullPath: string;
      searchText: string; // For better search matching
    }> = [];

    for (const path of allPaths) {
      const items = fileCache.get(path);
      if (!items) continue;

      for (const item of items) {
        const fullPath = path + item.name;
        // Check for duplicates
        const existingItem = allItems.find(i => i.fullPath === fullPath);
        if (!existingItem) {
          allItems.push({
            name: item.name,
            path: path,
            isDirectory: item.isDirectory,
            size: item.size,
            updatedAt: item.updatedAt,
            fullPath: fullPath,
            searchText: item.name + " " + path, // Combine name and path for better matching
          });
        }
      }
    }

    // Configure Fuse.js for powerful fuzzy search
    const fuseOptions = {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'searchText', weight: 0.3 }
      ],
      threshold: 0.6, // Lower = more strict, Higher = more fuzzy
      distance: 100,
      minMatchCharLength: 1,
      includeScore: true,
      ignoreLocation: true, // Ignore position of match
      findAllMatches: true,
      useExtendedSearch: true, // Enable advanced search patterns
    };

    const fuse = new Fuse(allItems, fuseOptions);
    
    // Perform the search
    const searchResults = fuse.search(query);
    
    // Convert Fuse results to our format
    const results = searchResults.map(result => ({
      name: result.item.name,
      path: result.item.path,
      isDirectory: result.item.isDirectory,
      size: result.item.size,
      updatedAt: result.item.updatedAt,
      isInCache: true, // Items found in search are by definition in cache since we're searching from cache
      score: (1 - (result.score || 0)) * 100, // Convert Fuse score to 0-100 scale
    }));

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