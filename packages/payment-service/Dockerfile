FROM node:20-alpine

WORKDIR /app

RUN npm install turbo --global

COPY . .

RUN npx turbo prune --scope=payment-service --docker

FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=0 /app/out/json/ .
COPY --from=0 /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=0 /app/out/full/ .
RUN npx turbo run build --filter=payment-service...

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=installer /app .

CMD [ "node", "packages/payment-service/dist/main" ]
