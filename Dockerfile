FROM node:18-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN set -eux; \
  for i in 1 2 3 4 5; do \
    pnpm install --frozen-lockfile && break; \
    echo "pnpm install failed (attempt $i), retrying..."; \
    sleep 5; \
  done
  
COPY . .
# RUN NEXT_PUBLIC_API_BASE_URL=http://host.docker.internal:3000 pnpm run build
RUN pnpm run build
RUN pnpm prune --prod

# ------------------------
# Production image
# ------------------------  
FROM node:18-alpine

WORKDIR /app

COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

EXPOSE 3000

# Run the app
CMD [ "node","server.js" ]