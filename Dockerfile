FROM oven/bun:1.2.19-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY apps/router/package.json ./apps/router/
COPY apps/state/package.json ./apps/state/
COPY apps/autopsy/package.json ./apps/autopsy/
COPY packages/types/package.json ./packages/types/
COPY packages/storage/package.json ./packages/storage/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Copy config
COPY aia.config.yaml ./
COPY shared ./shared

# Build packages
RUN cd packages/types && bun run build || true
RUN cd packages/storage && bun run build || true

# Expose port (Render will set PORT env var)
EXPOSE ${PORT:-3001}

# Create startup script
RUN echo '#!/bin/sh\n\
echo "Starting all services..."\n\
bun run apps/state/src/index.ts &\n\
bun run apps/router/src/index.ts &\n\
bun run apps/autopsy/src/index.ts &\n\
echo "All services started"\n\
wait\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
