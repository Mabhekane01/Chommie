FROM node:20-alpine

WORKDIR /app

COPY . .

# Prune the monorepo to just circle-service and its deps
RUN npx turbo prune circle-service --docker

FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=0 /app/out/json/ .
COPY --from=0 /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=0 /app/out/full/ .
RUN npx turbo run build --filter=circle-service...

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=installer /app .

CMD [ "node", "services/circle-service/dist/main" ]
