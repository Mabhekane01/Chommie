FROM node:18-alpine AS base
# Install pnpm globally at a specific version
RUN npm install -g pnpm@10.11.0
WORKDIR /app

# Development stage
FROM base AS development
# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy workspace configuration AND tsconfig.base.json
COPY --chown=nodejs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy all package.json files for dependency resolution
COPY --chown=nodejs:nodejs apps/api-gateway/package.json ./apps/api-gateway/
COPY --chown=nodejs:nodejs packages/config/package.json ./packages/config/
COPY --chown=nodejs:nodejs packages/database/package.json ./packages/database/
COPY --chown=nodejs:nodejs packages/redis/package.json ./packages/redis/
COPY --chown=nodejs:nodejs packages/types/package.json ./packages/types/
COPY --chown=nodejs:nodejs packages/utils/package.json ./packages/utils/

# Install all dependencies (including dev for TypeScript)
RUN pnpm install --no-frozen-lockfile

# Copy all shared module source code
COPY --chown=nodejs:nodejs shared/ ./shared/

# Build shared modules in dependency order to avoid TypeScript project reference issues
# Build config and types first (no dependencies)
RUN pnpm --filter "@packages/config" build && \
    pnpm --filter "@packages/types" build

# Build utils (may depend on config/types)
RUN pnpm --filter "@packages/utils" build

# Build database and redis (depend on config)
RUN pnpm --filter "@packages/database" build && \
    pnpm --filter "@packages/redis" build

# Copy api-gateway source (will be mounted in development)
COPY --chown=nodejs:nodejs apps/api-gateway/ .apps//api-gateway/

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Default development command (can be overridden by docker-compose)
CMD ["pnpm", "--filter", "api-gateway", "dev"]

# Production stage
FROM base AS production
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy workspace config AND tsconfig.base.json
COPY --chown=nodejs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY --chown=nodejs:nodejs apps/api-gateway/package.json ./apps/api-gateway/
COPY --chown=nodejs:nodejs packages/config/package.json ./packages/config/
COPY --chown=nodejs:nodejs packages/database/package.json ./packages/database/
COPY --chown=nodejs:nodejs packages/redis/package.json ./packages/redis/
COPY --chown=nodejs:nodejs packages/types/package.json ./packages/types/
COPY --chown=nodejs:nodejs packages/utils/package.json ./packages/utils/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile && \
    pnpm store prune

# Copy all shared module source code
COPY --chown=nodejs:nodejs shared/ ./shared/

# Build shared modules in dependency order
RUN pnpm --filter "@packages/config" build && \
    pnpm --filter "@packages/types" build && \
    pnpm --filter "@packages/utils" build && \
    pnpm --filter "@packages/database" build && \
    pnpm --filter "@packages/redis" build

# Build api-gateway
COPY --chown=nodejs:nodejs api-gateway/ ./api-gateway/
RUN pnpm --filter "api-gateway" build

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "api-gateway/dist/index.js"]