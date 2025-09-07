# Use Node.js 20 Alpine (required for better-sqlite3)
FROM node:20-alpine

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