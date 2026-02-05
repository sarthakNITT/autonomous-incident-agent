FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY packages ./packages
COPY apps/autopsy ./apps/autopsy

RUN bun install

WORKDIR /app/apps/autopsy

ENV BUN_ENV=docker

CMD ["bun", "run", "src/index.ts"]
