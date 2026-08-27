# ==============================================================================
# PRODUCTION BACKEND DOCKERFILE — Nandhipriya Electricals Express.js API
# Multi-stage optimized build with Alpine Linux, non-root user & Health Check
# ==============================================================================

# Build Stage
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Production Runner Stage
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

# Security: Run as non-root user
USER node

COPY --chown=node:node --from=builder /usr/src/app /usr/src/app

EXPOSE 5000

# Container Healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
