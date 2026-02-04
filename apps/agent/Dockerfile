FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY packages ./packages
COPY apps/agent ./apps/agent

RUN bun install

WORKDIR /app/apps/agent

CMD ["bun", "run", "src/index.ts"]
