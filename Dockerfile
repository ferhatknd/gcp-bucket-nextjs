# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

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