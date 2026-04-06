# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.14.0
ARG PNPM_VERSION=9.15.0

################################################################################
# Build base: includes native compilation toolchain needed for pnpm install.
FROM node:${NODE_VERSION}-alpine AS build-base

# libc6-compat: needed for some prebuilt native binaries on Alpine.
# python3, make, g++: needed for native addon compilation (e.g. bcrypt).
RUN apk add --no-cache libc6-compat python3 make g++

ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /usr/src/app

# Pin pnpm to the version declared in package.json.
ARG PNPM_VERSION
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

################################################################################
# Install dependencies in a cacheable layer before copying source code.
FROM build-base AS deps

# Copy only the files pnpm needs to resolve and install dependencies.
# This layer is cached as long as lockfile / workspace config don't change.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./

# Copy every package.json in the workspace so pnpm can resolve the workspace graph.
# --parents preserves directory structure (requires BuildKit / dockerfile:1 syntax).
COPY --parents packages/*/package.json ./

# Prisma schema is needed by altair-db's postinstall script (prisma generate).
COPY packages/altair-db/prisma/schema.prisma  packages/altair-db/prisma/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

################################################################################
# Build the application.
FROM deps AS build

# Now copy the full source (leverages cache from the deps layer above).
COPY . .

RUN pnpm turbo run build --filter=@altairgraphql/api...

# Create a self-contained deployable directory with production deps only.
RUN pnpm deploy --filter=@altairgraphql/api --prod /api-app

################################################################################
# Minimal runtime image — no build toolchain.
FROM node:${NODE_VERSION}-alpine AS final

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV TURBO_TELEMETRY_DISABLED=1

# pnpm is needed at runtime because the start script uses it.
ARG PNPM_VERSION
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

WORKDIR /app

COPY --from=build /api-app .

RUN chown -R node:node /app

USER node

# New Relic configuration
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["pnpm", "run", "start:prod:in-docker"]
