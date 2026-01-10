FROM node:20-alpine

WORKDIR /app

RUN npm install turbo --global

COPY . .

RUN npx turbo prune --scope=product-service --docker

FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=0 /app/out/json/ .
COPY --from=0 /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=0 /app/out/full/ .
RUN npx turbo run build --filter=product-service...

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=installer /app .

CMD [ "node", "packages/product-service/dist/main" ]
