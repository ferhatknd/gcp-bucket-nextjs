# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server using tsx (runs server.ts directly)
- `npm run build` - Build Next.js application for production
- `npm run start` - Build and start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run format` - Format code using Prettier
- `npm run depcheck` - Check for unused dependencies
- `npm run check` - Check for outdated packages

## Architecture Overview

This is a GCS file browser and upload service built with Next.js 15 and Google Cloud Storage. The application focuses on browsing and managing files in the `dbf-extracted/` directory with upload capabilities. Uses a hybrid architecture:

### Server Architecture
- **Custom Express Server**: `server.ts` handles file uploads with busboy for multipart parsing
- **Next.js App Router**: API routes in `src/app/api/` handle file operations (list, delete, rename, download)
- **Dual Server Setup**: Express handles uploads, Next.js handles other operations

### Key Components
- **Directory Browser**: Main interface for browsing `dbf-extracted/` directory structure with breadcrumb navigation
- **File Upload**: Upload dialog with file/folder selection, preserves directory structure when uploading folders
- **File Management**: Next.js API routes for directory listing, file operations (copy URL, download)  
- **Caching System**: SQLite-based persistent cache for directory contents (5min TTL)
- **Bulk Indexing**: Background indexing of all directories for faster search

### Storage & Services
- **Google Cloud Storage**: Primary storage backend via `src/lib/cloudStorage.ts`
- **SQLite Cache**: Persistent file cache in `cache/file-cache.db` for directory listings
- **File Type Support**: ZIP, RAR archives, PDF documents, Microsoft Office files (Word, Excel, PowerPoint) supported (minimum 10KB, maximum 3GB)
- **Size Constraints**: 
  - General uploads: 10KB to 3GB
  - Kernel uploads: 9MB to 51MB (special endpoint)

### Frontend Architecture
- **App Router Structure**: Single page application focused on directory browsing
- **Component Library**: Radix UI components with custom file browser UI
- **Animation**: Framer Motion for smooth transitions and loading states
- **Toast Notifications**: react-hot-toast for upload feedback
- **File Management**: Copy URLs, download files, multiple file/folder upload with directory structure preservation

### Special Features
- **Breadcrumb Navigation**: Navigate through directory structure with clickable breadcrumbs
- **Upload Dialog**: Modal with file/folder selection, progress tracking, and directory structure preservation
- **Multiple File Upload**: Support for selecting and uploading multiple files simultaneously
- **Folder Upload**: Complete folder upload with preserved directory structure and subdirectories
- **Search & Filter**: Real-time search within directory contents with Turkish character support
- **Persistent Cache**: SQLite database survives server restarts
- **Background Indexing**: Automatic indexing of all directories on startup

## Environment Configuration

Required environment variables (see `.env.example`):
- `GOOGLE_CLOUD_PROJECT_ID` - GCP project ID
- `GOOGLE_CLOUD_BUCKET_NAME` - GCS bucket name  
- `WEB_URL` - Application base URL
- `CDN_URL` - CDN URL for file serving
- `ADMIN_API_KEY` - Admin panel authentication
- `MAINTENANCE_MODE` - Enable/disable maintenance mode
- `PORT` - Server port (default: 3000)

## File Browser Flow

1. **Directory Browsing**: Navigate through `dbf-extracted/` directory structure
2. **Caching**: Directory contents cached in SQLite for fast loading
3. **Search**: Real-time filtering of files within current directory and subdirectories with flexible Turkish character matching
4. **Upload**: Upload files/folders to current directory via dialog
5. **File Operations**: Copy public URLs, download files directly

## Upload Process

1. User clicks Upload button in breadcrumb bar
2. Upload dialog opens with file/folder selection options
3. **File Upload**: Select multiple files, upload to current directory
4. **Folder Upload**: Select entire folder, preserves complete directory structure including subdirectories
5. Files stream to Express server with target directory path and relative paths for folder structure
6. Server validates files and uploads to GCS maintaining original directory hierarchy
7. Cache refreshes and new files/folders appear in browser

## Cache System

- **SQLite Database**: Persistent cache stored in `cache/file-cache.db`
- **TTL**: 5-minute cache duration with automatic cleanup
- **Background Indexing**: Indexes all directories on startup
- **Persistence**: Cache survives server restarts

## Search System

- **Scope**: Searches current directory and all subdirectories
- **Turkish Character Support**: Flexible matching where "urun" finds "ÜRÜN", "gelis" finds "GELİŞ"
- **Unicode Normalization**: Handles Turkish characters (İ, Ü, Ş, Ç, Ğ, I, Ö) with proper Unicode decomposition
- **Partial Word Matching**: "gelis" finds words containing "gelişitirme"
- **Multiple Terms**: All search words must be found in filename (AND operation)
- **Bidirectional**: Works both ways (Turkish ↔ ASCII equivalents)
- **Performance**: Simple substring search with regex fallback for complex cases