#!/bin/bash

# yarn ng build --outputHashing=none --prod --aot --stats-json

# Get new tags from remote
git fetch --tags

# Get latest tag name
LATEST_TAG=$(git describe --tags `git rev-list --tags --max-count=1`)

# Checkout latest tag
git checkout $LATEST_TAG
yarn lerna bootstrap
yarn lerna publish from-git --force-publish=* --no-git-tag-version --no-push --yes
git checkout master
