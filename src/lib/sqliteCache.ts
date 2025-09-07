import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

interface CachedFile {
  name: string;
  size?: number;
  updatedAt?: string;
  isDirectory: boolean;
  fullPath: string;
  cachedAt: number;
}

interface DirectoryCache {
  path: string;
  items: CachedFile[];
  cachedAt: number;
}

class SQLiteCache {
  private static instance: SQLiteCache;
  private db: Database.Database;
  private readonly CACHE_DURATION = Infinity; // No expiration

  private constructor() {
    // Create cache directory if it doesn't exist
    const cacheDir = path.join(process.cwd(), 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Initialize SQLite database
    const dbPath = path.join(cacheDir, 'file-cache.db');
    this.db = new Database(dbPath);
    
    // Create tables if they don't exist
    this.initializeTables();
  }

  private initializeTables(): void {
    // Create directories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS directory_cache (
        path TEXT PRIMARY KEY,
        cached_at INTEGER NOT NULL
      )
    `);

    // Create files table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS file_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        directory_path TEXT NOT NULL,
        name TEXT NOT NULL,
        size INTEGER,
        updated_at TEXT,
        is_directory BOOLEAN NOT NULL,
        full_path TEXT NOT NULL,
        cached_at INTEGER NOT NULL,
        FOREIGN KEY (directory_path) REFERENCES directory_cache (path)
      )
    `);

    // Create toggle states table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS toggle_states (
        full_path TEXT PRIMARY KEY,
        is_toggled BOOLEAN NOT NULL DEFAULT FALSE,
        toggled_at INTEGER NOT NULL
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_file_cache_directory_path 
      ON file_cache (directory_path)
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_directory_cache_cached_at 
      ON directory_cache (cached_at)
    `);
  }

  static getInstance(): SQLiteCache {
    if (!SQLiteCache.instance) {
      SQLiteCache.instance = new SQLiteCache();
    }
    return SQLiteCache.instance;
  }

  isValid(path: string): boolean {
    const stmt = this.db.prepare(`
      SELECT cached_at FROM directory_cache WHERE path = ?
    `);
    
    const result = stmt.get(path) as { cached_at: number } | undefined;
    
    if (!result) return false;
    
    return Date.now() - result.cached_at < this.CACHE_DURATION;
  }

  get(path: string): CachedFile[] | null {
    if (!this.isValid(path)) {
      return null;
    }

    const stmt = this.db.prepare(`
      SELECT name, size, updated_at, is_directory, full_path, cached_at
      FROM file_cache 
      WHERE directory_path = ?
      ORDER BY is_directory DESC, name ASC
    `);
    
    const rows = stmt.all(path) as Array<{
      name: string;
      size: number | null;
      updated_at: string | null;
      is_directory: number;
      full_path: string;
      cached_at: number;
    }>;

    return rows.map(row => ({
      name: row.name,
      size: row.size || undefined,
      updatedAt: row.updated_at || undefined,
      isDirectory: Boolean(row.is_directory),
      fullPath: row.full_path,
      cachedAt: row.cached_at
    }));
  }

  set(path: string, items: CachedFile[]): void {
    const now = Date.now();
    
    // Start transaction
    const transaction = this.db.transaction(() => {
      // Insert or update directory cache
      const dirStmt = this.db.prepare(`
        INSERT OR REPLACE INTO directory_cache (path, cached_at) 
        VALUES (?, ?)
      `);
      dirStmt.run(path, now);

      // Delete old files for this directory
      const deleteStmt = this.db.prepare(`
        DELETE FROM file_cache WHERE directory_path = ?
      `);
      deleteStmt.run(path);

      // Insert new files
      const fileStmt = this.db.prepare(`
        INSERT INTO file_cache 
        (directory_path, name, size, updated_at, is_directory, full_path, cached_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        fileStmt.run(
          path,
          item.name,
          item.size || null,
          item.updatedAt || null,
          item.isDirectory ? 1 : 0,
          item.fullPath,
          item.cachedAt || now
        );
      }
    });

    transaction();
  }

  clear(path?: string): void {
    if (path) {
      // Clear specific directory
      const transaction = this.db.transaction(() => {
        this.db.prepare(`DELETE FROM file_cache WHERE directory_path = ?`).run(path);
        this.db.prepare(`DELETE FROM directory_cache WHERE path = ?`).run(path);
      });
      transaction();
    } else {
      // Clear all cache
      this.db.exec(`DELETE FROM file_cache`);
      this.db.exec(`DELETE FROM directory_cache`);
    }
  }

  getStats(): { totalCached: number; paths: string[] } {
    const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM directory_cache`);
    const pathsStmt = this.db.prepare(`SELECT path FROM directory_cache ORDER BY path`);
    
    const countResult = countStmt.get() as { count: number };
    const pathsResult = pathsStmt.all() as Array<{ path: string }>;
    
    return {
      totalCached: countResult.count,
      paths: pathsResult.map(row => row.path)
    };
  }

  getAllCachedPaths(): string[] {
    const stmt = this.db.prepare(`SELECT path FROM directory_cache ORDER BY path`);
    const result = stmt.all() as Array<{ path: string }>;
    return result.map(row => row.path);
  }

  getAllEntries(): Map<string, CachedFile[]> {
    const entries = new Map<string, CachedFile[]>();
    
    // Get all directory paths
    const pathsStmt = this.db.prepare(`SELECT path FROM directory_cache ORDER BY path`);
    const paths = pathsStmt.all() as Array<{ path: string }>;
    
    // For each path, get its files
    const filesStmt = this.db.prepare(`
      SELECT name, size, updated_at, is_directory, full_path, cached_at
      FROM file_cache 
      WHERE directory_path = ?
      ORDER BY is_directory DESC, name ASC
    `);
    
    for (const { path } of paths) {
      const rows = filesStmt.all(path) as Array<{
        name: string;
        size: number | null;
        updated_at: string | null;
        is_directory: number;
        full_path: string;
        cached_at: number;
      }>;

      const items = rows.map(row => ({
        name: row.name,
        size: row.size || undefined,
        updatedAt: row.updated_at || undefined,
        isDirectory: Boolean(row.is_directory),
        fullPath: row.full_path,
        cachedAt: row.cached_at
      }));

      entries.set(path, items);
    }
    
    return entries;
  }

  isIndexingComplete(): boolean {
    const paths = this.getAllCachedPaths();
    return paths.includes('') && paths.length > 10;
  }

  // Clean up expired cache entries
  cleanupExpired(): void {
    // Skip cleanup when cache duration is Infinity (permanent cache)
    if (this.CACHE_DURATION === Infinity) {
      return;
    }
    
    const expiredTime = Date.now() - this.CACHE_DURATION;
    
    const transaction = this.db.transaction(() => {
      // Get expired directories
      const expiredDirs = this.db.prepare(`
        SELECT path FROM directory_cache WHERE cached_at < ?
      `).all(expiredTime) as Array<{ path: string }>;

      // Delete expired files
      for (const dir of expiredDirs) {
        this.db.prepare(`DELETE FROM file_cache WHERE directory_path = ?`).run(dir.path);
      }

      // Delete expired directories
      this.db.prepare(`DELETE FROM directory_cache WHERE cached_at < ?`).run(expiredTime);
    });

    transaction();
  }

  // Close database connection
  close(): void {
    this.db.close();
  }

  // Get database file size for monitoring
  getDatabaseSize(): number {
    try {
      const dbPath = path.join(process.cwd(), 'cache', 'file-cache.db');
      const stats = fs.statSync(dbPath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  // Toggle states management
  setToggleState(fullPath: string, isToggled: boolean): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO toggle_states (full_path, is_toggled, toggled_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(fullPath, isToggled ? 1 : 0, Date.now());
  }

  getToggleState(fullPath: string): boolean {
    const stmt = this.db.prepare(`
      SELECT is_toggled FROM toggle_states WHERE full_path = ?
    `);
    const result = stmt.get(fullPath) as { is_toggled: number } | undefined;
    return result ? Boolean(result.is_toggled) : false;
  }

  getAllToggleStates(): Record<string, boolean> {
    const stmt = this.db.prepare(`
      SELECT full_path, is_toggled FROM toggle_states WHERE is_toggled = 1
    `);
    const results = stmt.all() as Array<{ full_path: string; is_toggled: number }>;
    
    const toggleStates: Record<string, boolean> = {};
    results.forEach(row => {
      toggleStates[row.full_path] = Boolean(row.is_toggled);
    });
    
    return toggleStates;
  }

  removeToggleState(fullPath: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM toggle_states WHERE full_path = ?
    `);
    stmt.run(fullPath);
  }

  clearAllToggleStates(): void {
    this.db.exec(`DELETE FROM toggle_states`);
  }
}

export const sqliteCache = SQLiteCache.getInstance();