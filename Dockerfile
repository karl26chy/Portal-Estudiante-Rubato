FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist/ /app/frontend/dist/
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -qO- http://localhost:5000/api/health || exit 1
CMD ["node", "src/server.js"]
