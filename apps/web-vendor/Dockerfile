FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install turbo --global
COPY . .
RUN npx turbo prune --scope=web-vendor --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=builder /app/out/full/ .
RUN npx turbo run build --filter=web-vendor...

FROM nginx:alpine AS runner
COPY --from=installer /app/apps/web-vendor/dist/web-vendor/browser /usr/share/nginx/html
COPY apps/web-vendor/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
