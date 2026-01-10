FROM node:20-alpine

WORKDIR /app

# Install turbo
RUN npm install turbo --global

COPY . .

# Prune the project to include only api-gateway
RUN npx turbo prune --scope=api-gateway --docker

FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=0 /app/out/json/ .
COPY --from=0 /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=0 /app/out/full/ .
RUN npx turbo run build --filter=api-gateway...

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=installer /app .

CMD [ "node", "packages/api-gateway/dist/main" ]
