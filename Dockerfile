# syntax=docker/dockerfile:1.7
#
# AI for Meaning — production image.
# Multi-stage: dependencies → build → minimal non-root runtime (Next.js standalone output).
# No secrets are copied or baked in; runtime configuration arrives via environment variables.

ARG NODE_IMAGE=node:24.21.0-alpine@sha256:be80f76cf40ec8e42b9bec49f60a55e0660f30af58d3e5a25530785b30ea67e2

# ── 1. Dependencies ───────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apk add --no-cache libc6-compat && corepack enable
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ── 2. Build ──────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
RUN corepack enable
ARG APP_VERSION=0.0.0
ARG GIT_COMMIT=unknown
ARG NEXT_PUBLIC_SITE_URL=https://aiformeaning.com
ENV APP_VERSION=${APP_VERSION} \
    GIT_COMMIT=${GIT_COMMIT} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ── 3. Runtime ────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS runtime
WORKDIR /app
ARG APP_VERSION=0.0.0
ARG GIT_COMMIT=unknown
LABEL org.opencontainers.image.title="AI for Meaning" \
      org.opencontainers.image.source="https://github.com/roy-saurabh/ai_for_meaning" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${GIT_COMMIT}"
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    APP_VERSION=${APP_VERSION} \
    GIT_COMMIT=${GIT_COMMIT} \
    NODE_OPTIONS=--max-old-space-size=256

# The official image ships an unprivileged `node` user (uid 1000).
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
