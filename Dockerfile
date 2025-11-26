# ============================
# 1. Build Frontend (Vite)
# ============================
FROM node:18 AS frontend-build

WORKDIR /app

COPY frontend ./frontend

WORKDIR /app/frontend
RUN npm install && npm run build

# ============================
# 2. Build Backend
# ============================
FROM node:18 AS backend-build

WORKDIR /app

COPY backend ./backend

WORKDIR /app/backend
RUN npm install

# ============================
# 3. Final Runtime Image
# ============================
FROM node:18-slim

WORKDIR /app

COPY --from=backend-build /app/backend ./backend
COPY --from=frontend-build /app/frontend/dist ./backend/dist

WORKDIR /app/backend

EXPOSE 8080

CMD ["node", "server.js"]
