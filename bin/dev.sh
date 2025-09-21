#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(dirname "$0")
ROOT=$(cd "$SCRIPT_DIR/../" && pwd)/
cd "$ROOT"

(cd packages/altair-api; docker compose up --remove-orphans  --no-recreate -d)

pnpm install

trap_exit() {
  (cd packages/altair-api; docker compose down)
}
trap trap_exit EXIT

# stripe login (if API key is expired)
pnpm concurrently --kill-others "pnpm start:app" "pnpm start:api:dev" "pnpm start:redirect" "pnpm start:sandbox" "pnpm start:docs" "pnpm start:stripe:listen" --names app,api,redirect,sandbox,docs,stripe
