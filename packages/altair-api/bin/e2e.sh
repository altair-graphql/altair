#!/bin/bash

# set -euo pipefail

SCRIPT_DIR=$(dirname "$0")

# start e2e test database
docker compose -f "$SCRIPT_DIR/../docker-compose.e2e.yml" up -d --wait

# migrate e2e test database
pnpm migrate:e2e

# run e2e test
pnpm test:e2e --watch

# shutdown e2e test database
docker compose -f "$SCRIPT_DIR/../docker-compose.e2e.yml" down -v
