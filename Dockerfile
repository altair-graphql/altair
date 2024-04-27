FROM node:20-alpine3.19 AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@altairgraphql/api --docker

# ===

# Add lockfile and package.json's of isolated subworkspace
FROM node:20-alpine3.19 AS installer
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache python3 make g++
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
# we need full instead of json because of the prepare scripts which build?
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY turbo.json turbo.json
COPY nx.json nx.json
COPY tsconfig.json tsconfig.json
COPY CHECKS CHECKS
RUN yarn install

# Build the project and its dependencies
# COPY --from=builder /app/out/full/ .
# COPY turbo.json turbo.json

RUN yarn turbo run build --filter=@altairgraphql/api...

# ===

FROM node:20-alpine3.19 AS runner
WORKDIR /app


ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=3000
ENV PORT=${PORT}

ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=installer /app .

# EXPOSE ${PORT}

CMD ["yarn", "start:api:prod"]
