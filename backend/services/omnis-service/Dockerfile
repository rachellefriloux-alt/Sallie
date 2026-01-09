FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S omnis -u 1001

# Change ownership of the app directory
RUN chown -R omnis:nodejs /app
USER omnis

# Expose port
EXPOSE 8759

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8759/health || exit 1

# Start the application
CMD ["npm", "start"]
