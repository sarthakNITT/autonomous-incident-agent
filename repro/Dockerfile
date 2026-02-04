FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY app/test/generated ./app/test/generated

RUN bun install
