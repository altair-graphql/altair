#!/bin/bash
set -euo pipefail

# Always run from the repo root, regardless of where the script is invoked from
cd "$(dirname "$0")/.."

echo "Removing node_modules..."
rm -rf node_modules
rm -rf packages/*/node_modules

echo "Removing caches..."
rm -rf .turbo .nx .parcel-cache
rm -rf packages/*/.turbo
rm -rf packages/altair-app/.angular

echo "Installing dependencies..."
pnpm i

echo "Bootstrapping packages (ignoring turbo cache)..."
pnpm bootstrap --force

echo "Done!"
