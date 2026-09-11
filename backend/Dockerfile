# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production Run
FROM node:20-slim AS runner

WORKDIR /app

# Install production dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Install system dependencies: ffmpeg, python3, and curl for stream cropping
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp stream downloader binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Generate prisma client for runtime
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/index.js"]
