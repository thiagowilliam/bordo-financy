# syntax=docker/dockerfile:1
# Build context is the repository root:
#   docker build -f apps/web/Dockerfile -t bordo-web .

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# The root `prepare` script installs Husky hooks, which makes no sense in an image.
ENV HUSKY=0
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo

FROM base AS build
# Manifests first so the dependency layer is cached until a dependency changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "@bordo/web..."

# The web app reads `packages/shared` source through a `paths` alias, so it is copied whole.
COPY packages/shared packages/shared
COPY apps/web apps/web
# The `/api/*` rewrite is resolved at build time, so the API address is a build argument.
ARG BACKEND_URL=http://api:3001
ENV BACKEND_URL=$BACKEND_URL
RUN pnpm --filter @bordo/web build

FROM node:22-slim AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app
# `output: "standalone"` with the repo root as tracing root keeps the monorepo layout.
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)).then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]
