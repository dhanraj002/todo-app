# Stage 1: Build React frontend
FROM node:20 AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Set up backend
FROM node:20 AS backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Copy frontend build to backend static folder
COPY --from=frontend-build /app/client/build ./public

# Expose port and run backend
EXPOSE 5000
CMD ["node", "index.js"] 