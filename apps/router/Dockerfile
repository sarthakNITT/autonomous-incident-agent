FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY packages ./packages
COPY apps/router ./apps/router

RUN bun install

WORKDIR /app/apps/router

CMD ["bun", "run", "src/index.ts"]
