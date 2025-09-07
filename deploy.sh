#!/bin/bash

# Cloud Run deployment script
# Usage: ./deploy.sh

# Set your project ID here
PROJECT_ID="your-project-id"

echo "🚀 Starting Cloud Run deployment..."

# Build and deploy using gcloud
gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID

echo "✅ Deployment completed!"
echo "🌐 Your app will be available at: https://gcp-bucket-nextjs-[hash]-uc.a.run.app"