# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --include=optional

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Create cache directory
RUN mkdir -p cache

# Expose port
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000

# Start the server
CMD ["npm", "run", "start"]