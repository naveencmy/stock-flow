# ==============================================================================
# PRODUCTION FRONTEND DOCKERFILE — Nandhipriya Electricals React Client
# Multi-stage build: Node.js 18 Vite Compiler -> Nginx Alpine Web Server
# ==============================================================================

# Stage 1: Build the Vite React application
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build production bundle
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:5000/api}
RUN npm run build

# Stage 2: Serve with high-performance Nginx Alpine
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built bundle from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
