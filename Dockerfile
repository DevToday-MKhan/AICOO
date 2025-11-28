# Use Node 18 LTS slim image
FROM node:18-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
FROM base AS dependencies
RUN npm ci

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY package*.json ./

# Expose port (Railway will inject PORT env var)
EXPOSE 3000

# Run migrations and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
