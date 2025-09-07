#!/bin/bash

# Cloud Run deployment script
# Usage: ./deploy.sh

# Extract project ID from URL
PROJECT_ID="gcp-bucket-1074807643813"
REGION="europe-west1"
SERVICE_NAME="gcp-bucket"

echo "🚀 Starting direct Cloud Run deployment..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"

# Direct deploy without Cloud Build trigger
gcloud run deploy $SERVICE_NAME \
  --source . \
  --project $PROJECT_ID \
  --region $REGION \
  --allow-unauthenticated \
  --port 6060 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --platform managed

echo "✅ Deployment completed!"
echo "🌐 Your app is available at: https://gcp-bucket-1074807643813.europe-west1.run.app"