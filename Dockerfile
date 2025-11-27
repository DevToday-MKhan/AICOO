# ============================
# 1. Build Remix App
# ============================
FROM node:18 AS remix-build

WORKDIR /app

# Copy package files and npm config
COPY .npmrc ./
COPY package*.json ./
COPY tsconfig.json ./
COPY remix.config.js ./

# Copy Remix app directory
COPY app ./app

# Install dependencies and build Remix
RUN npm install
RUN npx remix build

# ============================
# 2. Build Backend
# ============================
FROM node:18 AS backend-build

WORKDIR /app/backend

COPY .npmrc ../
COPY backend/package*.json ./
RUN npm install

COPY backend ./

# ============================
# 3. Final Runtime Image
# ============================
FROM node:18-slim

WORKDIR /app

# Copy Remix build artifacts
COPY --from=remix-build /app/build ./build
COPY --from=remix-build /app/public ./public
COPY --from=remix-build /app/node_modules ./node_modules
COPY --from=remix-build /app/package.json ./package.json

# Copy backend
COPY --from=backend-build /app/backend ./backend

# Copy server.js and config
COPY server.js ./server.js
COPY config ./config

# Set production environment
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server.js"]
