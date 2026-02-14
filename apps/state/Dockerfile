# Base image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lockb ./
COPY apps/state/package.json ./apps/state/
COPY packages ./packages
COPY shared ./shared
RUN bun install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN cd apps/state && npx prisma generate

# Production
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/apps/state ./apps/state
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/aia.config.yaml ./

WORKDIR /app/apps/state

EXPOSE 3003

CMD ["bun", "run", "src/index.ts"]
