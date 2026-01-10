FROM node:20-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
RUN npm install turbo --global
COPY . .
RUN npx turbo prune --scope=web-customer --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
RUN npx turbo run build --filter=web-customer...

FROM nginx:alpine AS runner
COPY --from=installer /app/apps/web-customer/dist/web-customer/browser /usr/share/nginx/html
COPY apps/web-customer/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
