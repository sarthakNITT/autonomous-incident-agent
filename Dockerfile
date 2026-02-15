FROM oven/bun:1.2.19-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY apps/router/package.json ./apps/router/
COPY apps/state/package.json ./apps/state/
COPY apps/autopsy/package.json ./apps/autopsy/
COPY packages/types/package.json ./packages/types/
COPY packages/storage/package.json ./packages/storage/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Copy production config
COPY aia.config.production.yaml ./aia.config.yaml
COPY shared ./shared

# Build packages
RUN cd packages/types && bun run build || true
RUN cd packages/storage && bun run build || true

# Expose port (Render will set PORT env var)
EXPOSE 3001

# Start all services
CMD ["sh", "-c", "bun run apps/state/src/index.ts & bun run apps/router/src/index.ts & bun run apps/autopsy/src/index.ts & wait"]
