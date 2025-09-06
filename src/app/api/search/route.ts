import { NextRequest, NextResponse } from "next/server";
import { fileCache } from "@/lib/fileCache";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const currentPath = searchParams.get("currentPath") || "dbf-extracted/";

  if (!query || query.trim() === "") {
    return NextResponse.json({ results: [] });
  }

  try {
    // More flexible normalize function for Turkish characters
    const normalizeForSearch = (text: string): string => {
      return text
        .toLowerCase()
        // Very flexible Turkish character replacements
        .replace(/[ğĞg]/g, '[gğĞ]')
        .replace(/[üÜu]/g, '[uüÜ]')  
        .replace(/[şŞs]/g, '[sşŞ]')
        .replace(/[ıİIi]/g, '[iıİI]')
        .replace(/[öÖo]/g, '[oöÖ]')
        .replace(/[çÇc]/g, '[cçÇ]')
        // Handle spaces and special characters
        .replace(/[_\-\s]+/g, '.*')
        .trim();
    };

    // Simple normalize function for creating regex-safe patterns
    const simpleNormalize = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[ğĞ]/g, 'g')
        .replace(/[üÜ]/g, 'u')  
        .replace(/[şŞ]/g, 's')
        .replace(/[ıİI]/g, 'i')
        .replace(/[öÖ]/g, 'o')
        .replace(/[çÇ]/g, 'c')
        .replace(/[_\-\s]+/g, ' ')
        .trim();
    };

    // Function to check if text contains word with flexible Turkish character matching
    const containsFlexible = (text: string, searchWord: string): boolean => {
      // Normalize text and search word to handle Unicode variations
      const normalizeText = (str: string): string => {
        return str
          .toLowerCase()
          .normalize('NFD') // Decompose characters
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/combining marks
          .normalize('NFC'); // Recompose
      };
      
      const normalizedText = normalizeText(text);
      const normalizedSearch = normalizeText(searchWord);
      
      // Simple substring search after normalization - this should work for most cases
      if (normalizedText.includes(normalizedSearch)) {
        return true;
      }
      
      // If simple search doesn't work, try flexible character matching
      const createFlexiblePattern = (word: string): string => {
        return word
          .replace(/[gğ]/g, '[gğĞG]')
          .replace(/[uü]/g, '[uüÜU]')
          .replace(/[sş]/g, '[sşŞS]')
          .replace(/[iı]/g, '[iıİI]') // Handle both regular i and Turkish ı
          .replace(/[oö]/g, '[oöÖO]')
          .replace(/[cç]/g, '[cçÇC]')
          // Escape special regex characters
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };

      const flexiblePattern = createFlexiblePattern(normalizedSearch);
      const regex = new RegExp(flexiblePattern, 'i');
      return regex.test(normalizedText);
    };

    // Split search query into individual words - DON'T normalize the search terms
    const searchWords = query.toLowerCase().split(' ').filter(word => word.length > 0);
    
    const results: Array<{
      name: string;
      path: string;
      isDirectory: boolean;
      size?: number;
      updatedAt?: string;
    }> = [];

    // Get all cached paths that start with currentPath (current directory and subdirectories)
    const cacheStats = fileCache.getStats();
    const allPaths = cacheStats.paths.filter(path => path.startsWith(currentPath));

    for (const path of allPaths) {
      const items = fileCache.get(path);
      if (!items) continue;

      for (const item of items) {
        // Very flexible character matching
        const itemName = item.name.toLowerCase();
        
        const allWordsFound = searchWords.every(word => {
          // Check if the word can be found with flexible matching
          return containsFlexible(itemName, word);
        });

        if (allWordsFound) {
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