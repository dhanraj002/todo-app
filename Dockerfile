# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Stage 2: Set up backend
FROM node:20-alpine AS backend

# Create app user for security
RUN addgroup -g 1001 -S appgroup
RUN adduser -S appuser -u 1001 -G appgroup

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./

# Copy frontend build to backend static folder
COPY --from=frontend-build /app/client/build ./public

# Create data directory and set permissions
RUN mkdir -p /app/server/data && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port and run backend
EXPOSE 5000
CMD ["node", "index.js"] 