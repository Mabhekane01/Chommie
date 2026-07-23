FROM node:20-alpine

WORKDIR /app

COPY . .

# Prune the monorepo to just supply-service and its deps
RUN npx turbo prune supply-service --docker

FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=0 /app/out/json/ .
COPY --from=0 /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=0 /app/out/full/ .
RUN npx turbo run build --filter=supply-service...

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=installer /app .

CMD [ "node", "services/supply-service/dist/main" ]
