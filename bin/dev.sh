#!/bin/bash

set -euo pipefail

# Verify Node.js version
REQUIRED_NODE_VERSION=22
CURRENT_NODE_VERSION=$(node -v | sed 's/v//;s/\..*//')

if [ "$CURRENT_NODE_VERSION" -lt "$REQUIRED_NODE_VERSION" ]; then
  echo "❌ Error: Node.js version $REQUIRED_NODE_VERSION or higher is required."
  echo "   Current version: $(node -v)"
  echo "   Please upgrade Node.js to continue (nvm install $REQUIRED_NODE_VERSION)."
  exit 1
fi


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
