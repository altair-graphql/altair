#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(dirname "$0")
ROOT=$(cd "$SCRIPT_DIR/../" && pwd)/
cd "$ROOT"

(cd packages/altair-api; docker compose up  --no-recreate -d)

yarn

# stripe login (if API key is expired)
npx concurrently --kill-others "yarn start:app" "yarn start:api:dev" "yarn start:redirect" "yarn start:sandbox" "yarn start:stripe:listen" --names app,api,redirect,sandbox,stripe
