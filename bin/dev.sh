#!/bin/bash

set -e

SCRIPT_DIR=$(dirname "$0")
ROOT=$(cd "$SCRIPT_DIR/../" && pwd)/
cd "$ROOT"

(cd packages/altair-api; docker compose up  --no-recreate -d)

npx concurrently --kill-others "yarn start:app" "yarn start:api:dev" "yarn start:redirect" "yarn start:dashboard" --names app,api,redirect,dashboard
