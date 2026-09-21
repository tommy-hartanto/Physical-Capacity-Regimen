# Stage 1: Build frontend
FROM node:22-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Build static assets
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV DATA_DIR=/data

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy built frontend assets and server
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Prepare persistent volume mount point
RUN mkdir -p /data

EXPOSE 8080

CMD ["node", "server.js"]
