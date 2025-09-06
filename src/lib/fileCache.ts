// SQLite-based persistent file cache system for better performance
import { sqliteCache } from './sqliteCache';

interface CachedFile {
  name: string;
  size?: number;
  updatedAt?: string;
  isDirectory: boolean;
  fullPath: string;
  cachedAt: number;
}

class FileCache {
  private static instance: FileCache;

  private constructor() {
    // Clean up expired cache entries on startup
    sqliteCache.cleanupExpired();
  }

  static getInstance(): FileCache {
    if (!FileCache.instance) {
      FileCache.instance = new FileCache();
    }
    return FileCache.instance;
  }

  isValid(path: string): boolean {
    return sqliteCache.isValid(path);
  }

  get(path: string): CachedFile[] | null {
    return sqliteCache.get(path);
  }

  set(path: string, items: CachedFile[]): void {
    sqliteCache.set(path, items);
  }

  clear(path?: string): void {
    sqliteCache.clear(path);
  }

  // Get cached items count for debugging
  getStats(): { totalCached: number; paths: string[] } {
    return sqliteCache.getStats();
  }

  // Get all cached paths
  getAllCachedPaths(): string[] {
    return sqliteCache.getAllCachedPaths();
  }

  // Check if indexing is complete
  isIndexingComplete(): boolean {
    return sqliteCache.isIndexingComplete();
  }

  // Clean up expired cache entries
  cleanupExpired(): void {
    sqliteCache.cleanupExpired();
  }

  // Get database size for monitoring
  getDatabaseSize(): number {
    return sqliteCache.getDatabaseSize();
  }
}

export const fileCache = FileCache.getInstance();
export type { CachedFile };