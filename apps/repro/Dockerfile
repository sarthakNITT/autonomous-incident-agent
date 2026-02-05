FROM oven/bun:1

# Install Git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy repo (in context of CI, we might mount it or clone it)
# For this orchestration, we start from scratch or expect volume mounts.
# We will use the workspace structure.

COPY package.json bun.lockb ./
COPY packages/types ./packages/types
COPY packages/storage ./packages/storage
COPY apps/repro ./apps/repro
COPY shared ./shared
COPY config ./config

# Install dependencies
RUN bun install --production

# Repro orchestrator entrypoint
CMD ["bun", "run", "apps/repro/src/orchestrator.ts"]
