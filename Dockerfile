FROM node:20-alpine3.19 AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed
RUN apk update && apk add --no-cache libc6-compat python3 make g++ py3-pip && rm -rf /var/cache/apk/*
RUN ln -sf python3 /usr/bin/python
ENV TURBO_TELEMETRY_DISABLED=1

# ===

FROM base AS builder
# Set working directory
WORKDIR /app
RUN yarn global add turbo@^2
COPY . .
# copy packages that @altairgraphql/api depends on to out directory
RUN turbo prune --scope=@altairgraphql/api --docker

# ===

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app
# First install dependencies (as they change less often)
COPY .gitignore .gitignore
# FIXME: running yarn install with --ignore-scripts means that some packages may not get built correctly. Skipping these steps for now.
# COPY --from=builder /app/out/json/ .
# COPY --from=builder /app/out/yarn.lock ./yarn.lock
# # install node_modules without running scripts (scripts depend on the source files)
# RUN yarn install --ignore-scripts
# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY nx.json nx.json
COPY tsconfig.json tsconfig.json
COPY CHECKS CHECKS
# build the project, running the prepare scripts
# Somehow get an unknown error if I don't install nx first
RUN yarn add nx -W
# yarn install 2> >(grep -v warning 1>&2)
RUN yarn
RUN yarn turbo run build --filter=@altairgraphql/api...

# ===

FROM base AS runner
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG PORT=3000
ENV PORT=${PORT}
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
COPY --from=installer /app .
# new relic env variables
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

# EXPOSE ${PORT}

CMD ["yarn", "start:api:prod"]
