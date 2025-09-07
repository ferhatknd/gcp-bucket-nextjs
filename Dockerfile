# Use Node.js 22 Alpine (required for better-sqlite3)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install Python and build tools (required for native dependencies)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci --include=optional

# Copy source code
COPY . .

# Set build arguments and environment variables
ARG GOOGLE_CLOUD_PROJECT_ID
ARG GOOGLE_CLOUD_BUCKET_NAME
ARG WEB_URL
ARG CDN_URL
ARG ADMIN_API_KEY
ARG MAINTENANCE_MODE

ENV GOOGLE_CLOUD_PROJECT_ID=$GOOGLE_CLOUD_PROJECT_ID
ENV GOOGLE_CLOUD_BUCKET_NAME=$GOOGLE_CLOUD_BUCKET_NAME
ENV WEB_URL=$WEB_URL
ENV CDN_URL=$CDN_URL
ENV ADMIN_API_KEY=$ADMIN_API_KEY
ENV MAINTENANCE_MODE=$MAINTENANCE_MODE

# Build Next.js application
RUN npm run build

# Clean up dev dependencies after build
RUN npm prune --production

# Create cache directory
RUN mkdir -p cache

# Expose port
EXPOSE 6060

# Set environment variable for port
ENV PORT=6060

# Start the server
CMD ["npm", "run", "start"]