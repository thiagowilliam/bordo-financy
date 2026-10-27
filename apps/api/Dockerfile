# syntax=docker/dockerfile:1
# Build context is the repository root:
#   docker build -f apps/api/Dockerfile -t bordo-api .

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# The root `prepare` script installs Husky hooks, which makes no sense in an image.
ENV HUSKY=0
RUN corepack enable
WORKDIR /repo

FROM base AS build
# Manifests first so the dependency layer is cached until a dependency changes.
# apps/web only needs its manifest: the lockfile lists it as a workspace project.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "@bordo/api..."

COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @bordo/shared build && pnpm --filter @bordo/api build
# --legacy: pnpm 10 only deploys injected workspaces by default.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter @bordo/api deploy --legacy --prod /out

FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out/package.json ./
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/dist ./dist
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]
