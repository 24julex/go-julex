FROM node:20-alpine

# OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/ .
# Frontend mock catalog needed by the store product sync (server/src/sync-store-products.js)
COPY src/data/multiVerticalMockData.js /src/data/multiVerticalMockData.js
# Regenerate the Prisma client for Linux (committed client has a Windows engine)
RUN npx prisma generate

# SQLite data lives on a mounted volume
ENV DATABASE_URL=file:/data/julex.db
RUN mkdir -p /data

COPY server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000
ENTRYPOINT ["/entrypoint.sh"]
