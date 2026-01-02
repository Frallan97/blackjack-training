# ===========================
# Stage 1: Build with Bun
# ===========================
FROM oven/bun:1 AS build
WORKDIR /app

# Copy dependency files first (layer caching)
COPY package.json bun.lock* ./
COPY bunfig.toml ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY build.ts ./
COPY tsconfig.json ./
COPY components.json ./
COPY src/ ./src/
COPY styles/ ./styles/

# Run the custom build script
# The build.ts scans for *.html files in src/ and outputs to dist/
RUN bun run build

# Verify build output
RUN ls -la /app/dist/

# ===========================
# Stage 2: Nginx Runtime
# ===========================
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Security: Run as non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
