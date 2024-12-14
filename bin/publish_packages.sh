#!/bin/bash

pnpm ng build --output-hashing=none --prod --aot --stats-json

# Get new tags from remote
git fetch --tags

# Get latest tag name
LATEST_TAG=$(git describe --tags `git rev-list --tags --max-count=1`)

# Checkout latest tag
# git checkout $LATEST_TAG
pnpm publish-packages
