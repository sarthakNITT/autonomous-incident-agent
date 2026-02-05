FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY packages packages
COPY apps/dashboard apps/dashboard

RUN bun install

WORKDIR /app/apps/dashboard

EXPOSE 3000

CMD ["bun", "run", "start"]
