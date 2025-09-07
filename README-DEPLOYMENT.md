# Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud CLI** installed and authenticated
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

2. **Enable required APIs**
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Environment Variables

Set these environment variables in Cloud Run:

```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name
WEB_URL=https://your-domain.com
CDN_URL=https://storage.googleapis.com/your-bucket-name
ADMIN_API_KEY=your-secure-api-key
MAINTENANCE_MODE=false
PORT=3000
```

## Deployment Methods

### Method 1: Using gcloud command (Recommended)
```bash
# Update PROJECT_ID in deploy.sh
./deploy.sh
```

### Method 2: Manual deployment
```bash
# Build and submit
gcloud builds submit --config cloudbuild.yaml

# Or build and deploy directly
gcloud run deploy gcp-bucket-nextjs \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1
```

## Important Notes

1. **Service Account**: Cloud Run service needs Storage permissions
2. **Memory**: 1GB recommended for SQLite cache + file processing
3. **Cache**: SQLite cache is ephemeral in Cloud Run - will reset on restart
4. **Cold starts**: First request may be slow due to cache rebuild

## Post-deployment

1. **Set custom domain** (optional)
2. **Configure CDN** for better performance  
3. **Set up monitoring** and alerts
4. **Test file upload/search functionality**

## Troubleshooting

- **Permission errors**: Check service account permissions
- **Memory errors**: Increase memory allocation
- **Cache issues**: Monitor logs for SQLite errors