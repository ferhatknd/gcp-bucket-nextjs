# GCP Bucket NextJS File Browser

A powerful Google Cloud Storage file browser and management system built with Next.js 15. This project is forked and enhanced with advanced search capabilities and Turkish character support.

## 🚀 Features

### Core Functionality
- **📁 Directory Browser**: Navigate through entire GCS bucket directory structure with breadcrumb navigation
- **🔘 Toggle States**: Apple-style toggle switches for files with persistent state and green background highlighting (only shown for indexed directories)
- **📤 File Upload**: Upload files and complete folders with preserved directory structure
- **🔍 Advanced Search**: Google-like search with Fuse.js integration
- **💾 Persistent Cache**: SQLite-based caching system for fast file browsing
- **🌐 Turkish Character Support**: Unicode normalization for flexible Turkish character matching
- **🔐 Environment-based Auth**: Authentication bypassed in development, active in production
- **🧭 Fixed Navigation**: Persistent header navigation between Home (/) and Admin Panel (/panel)

### Search Capabilities
- **Fuzzy Matching**: Typo-tolerant search that finds closest matches
- **Partial Word Matching**: "gelis" finds "GELİŞİTİRME"
- **Bidirectional Turkish Support**: "urun" finds "ÜRÜN" and vice versa  
- **Multi-word Search**: Google-style search with relevance scoring
- **Real-time Results**: Instant search across 1000+ files with scoring

### Technical Features
- **Flexible Server Architecture**: Pure Next.js for development, Express.js for production uploads
- **Background Indexing**: Automatic bulk indexing of all directories on startup
- **Toggle State Persistence**: SQLite database for persistent file toggle states across sessions (restricted to indexed directories)
- **File Type Support**: ZIP, RAR, PDF, Office documents (10KB - 3GB)
- **Optimized Admin Panel**: Cached API endpoints for faster file loading from SQLite instead of direct bucket queries
- **Session Storage**: Persistent admin authentication without re-entering API key
- **Cloud Run Ready**: Docker configuration for Google Cloud Run deployment with CI/CD pipeline
- **Clean URL Structure**: Uses proper routes (/, /panel) instead of query parameters
- **Protected API Endpoints**: Server middleware protection for sensitive operations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Radix UI
- **Backend**: Express.js, Google Cloud Storage SDK
- **Search**: Fuse.js for advanced fuzzy search
- **Database**: Better SQLite3 for persistent caching
- **Animation**: Framer Motion for smooth UI transitions
- **Deployment**: Docker + Google Cloud Run

## 📋 Getting Started

### Prerequisites
- Node.js 22+
- Google Cloud Storage bucket
- Service account with Storage permissions

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dogrucevap/gcp-bucket-nextjs.git
cd gcp-bucket-nextjs
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
# Edit .env.local with your GCS credentials
```

4. **Start development server**
```bash
# Pure Next.js development (recommended)
npx next dev

# Or Express server (for production-like environment)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the file browser.

## 🚀 Deployment

### Cloud Run Deployment

1. **Prepare deployment**
```bash
# Update PROJECT_ID in deploy.sh
./deploy.sh
```

2. **Set environment variables** in Cloud Run console:
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `GOOGLE_CLOUD_BUCKET_NAME`
   - `WEB_URL`
   - `CDN_URL`
   - `ADMIN_API_KEY`

See [README-DEPLOYMENT.md](./README-DEPLOYMENT.md) for detailed deployment guide.

## 🔍 Search System

The advanced search system supports:

- **Turkish Character Flexibility**: "gida" finds "GIDA", "gelis" finds "GELİŞ"
- **Fuzzy Matching**: Handles typos and partial matches
- **Multi-word Queries**: "Gıda zehirlenmesi analizleri" finds relevant files
- **Relevance Scoring**: Best matches appear first
- **Subdirectory Search**: Searches current directory and all subdirectories

## 🏗️ Admin Panel

Access the admin panel at `/panel` with the following features:

- **Fixed Header Navigation**: Persistent navigation between Home (/) and Admin Panel (/panel) views
- **Cached File Loading**: Optimized performance using SQLite cache instead of direct bucket queries
- **Session Storage**: API key persists across page refreshes - no need to re-authenticate
- **Toggle State Management**: View and manage all file toggle states with persistent green highlighting (only for indexed files)
- **Bulk Indexing**: Manual trigger button to force re-indexing of all directories
- **Real-time Statistics**: View total files, total size, and cache statistics
- **Clean URL Structure**: Direct routing to /panel instead of query parameters

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes (files, cached, toggle, directory)
│   │   ├── panel/        # Admin panel pages
│   │   └── page.tsx      # Home page with directory browser
│   ├── components/       # React components
│   │   ├── file/         # DirectoryBrowser, ToggleSwitch, UploadDialog
│   │   ├── layout/       # PanelHeader (fixed navigation)
│   │   ├── panel/        # AdminFileManager, LoginForm
│   │   └── ui/           # UI components (Button, SearchBar, Icons)
│   ├── hooks/            # Custom hooks (useFileManagement, useAuth)
│   ├── lib/             # Utilities and services (cloudStorage, sqliteCache, fileCache)
│   └── types/           # TypeScript definitions
├── cache/               # SQLite database storage (file-cache.db)
├── server.ts           # Express.js server with middleware protection
├── Dockerfile          # Container configuration
└── cloudbuild.yaml     # Google Cloud Build config
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Original Next.js template from Vercel
- Enhanced with advanced search and Turkish language support
- Built for efficient Google Cloud Storage management
