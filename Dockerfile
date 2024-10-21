# This Dockerfile defines a multi-stage build process for building and deploying an application using Yarn workspaces, TurboRepo for efficient monorepo management, and Alpine Linux for a minimal image size.

# === Base Stage ===
# Builds a base image with necessary system dependencies.
FROM node:20-alpine3.19 AS base

# Install system packages required for building and running the application.
# - libc6-compat: Provides compatibility for libraries compiled against glibc. [# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed]
# - python3, make, g++: Essential build tools for various dependencies.
# - py3-pip: Package installer for Python 3.
RUN apk update && \
    apk add --no-cache libc6-compat python3 make g++ py3-pip && \
    rm -rf /var/cache/apk/* && \
    ln -sf python3 /usr/bin/python 

# Disable telemetry in the Turbo build system.
ENV TURBO_TELEMETRY_DISABLED=1

# === Builder Stage ===
# Builds the application using TurboRepo, taking advantage of its caching mechanisms.
FROM base AS builder

# Set the working directory inside the container to /app.
WORKDIR /app

# Install TurboRepo globally for managing the monorepo build.
RUN yarn global add turbo@^2

# Copy the entire project directory into the container.
COPY . .

# Prune the workspace to prepare for building the @altairgraphql/api sub-project, ensuring only its dependencies are included, minimizing the final image size.
RUN turbo prune --scope=@altairgraphql/api --docker

# === Installer Stage ===
# This stage prepares the final runtime image by copying build artifacts and installing production dependencies.
FROM base AS installer

# Set the working directory inside the container to /app.
WORKDIR /app

# Copy the .gitignore file to avoid adding unnecessary files to the image.
COPY .gitignore .gitignore

# FIXME: running yarn install with --ignore-scripts means that some packages may not get built correctly. Skipping these steps for now.
# COPY --from=builder /app/out/json/ .
# COPY --from=builder /app/out/yarn.lock ./yarn.lock
# # install node_modules without running scripts (scripts depend on the source files)
# RUN yarn install --ignore-scripts

# Copy the built application code from the builder stage.
COPY --from=builder /app/out/full/ .

# Copy configuration files for TurboRepo and Nx (a build system used within the project).
COPY turbo.json turbo.json
COPY nx.json nx.json
COPY tsconfig.json tsconfig.json
COPY CHECKS CHECKS

# Install production dependencies.
RUN yarn

# Build the @altairgraphql/api project, utilizing Turbo's caching for speed.
RUN yarn turbo run build --filter=@altairgraphql/api...

# === Runner Stage ===
# This stage defines the final runtime environment for the application.
FROM base AS runner

# Set the working directory inside the container to /app.
WORKDIR /app

# Set the NODE_ENV environment variable to "production".
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set the application port.
ARG PORT=3000
ENV PORT=${PORT}

# Create a non-root user for running the application for improved security.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Switch to the newly created user.
USER nodejs

# Copy the built application and its dependencies from the installer stage.
COPY --from=installer /app .

# Configure New Relic monitoring.
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

#--------------
# SUGGESTION - Define a health check to ensure the container is running correctly. This example assumes a /health endpoint is available. Adjust according to your application.
# HEALTHCHECK --interval=30s --timeout=10s CMD curl --fail http://localhost:${PORT}/health || exit 1
#--------------

# Start the application.
CMD ["yarn", "start:api:prod"]
