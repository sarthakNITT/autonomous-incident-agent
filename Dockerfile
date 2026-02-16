FROM oven/bun:1-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git openssh

# Copy package files
COPY package.json bun.lock* ./
COPY apps/router/package.json ./apps/router/
COPY apps/state/package.json ./apps/state/
COPY apps/autopsy/package.json ./apps/autopsy/
COPY apps/git/package.json ./apps/git/
COPY apps/repro/package.json ./apps/repro/
COPY apps/dashboard/package.json ./apps/dashboard/
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

# Generate Prisma Client
RUN bunx prisma generate

# Build packages
RUN cd packages/types && bun run build || true
RUN cd packages/storage && bun run build || true

# Expose port (Render will set PORT env var)
EXPOSE 3001

# Start all services
CMD ["sh", "-c", "bun run apps/state/src/index.ts & bun run apps/router/src/index.ts & bun run apps/autopsy/src/index.ts & bun run apps/git/src/index.ts & bun run apps/repro/src/server.ts & bun run apps/dashboard/src/index.ts & wait"]
