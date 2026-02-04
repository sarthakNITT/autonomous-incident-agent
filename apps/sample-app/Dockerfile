FROM oven/bun:latest as base

WORKDIR /app

# Copy root config
COPY turbo.json .
COPY package.json .
COPY bun.lock .
COPY bunfig.toml .

# Copy packages
COPY packages ./packages

# Copy apps
COPY apps/sample-app ./apps/sample-app

# Install dependencies (workspaces)
RUN bun install

# Build the app (if needed, but for Bun we can just run source)
# RUN cd apps/sample-app && bun run build

EXPOSE 3000

WORKDIR /app/apps/sample-app

# Run directly with Bun
CMD ["bun", "run", "src/index.ts"]
