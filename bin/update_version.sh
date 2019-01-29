#!/bin/bash

if [ -z "$1" ]
  then
    echo "No version supplied."
    exit 1
fi

NEW_VERSION=$1
OLD_BASE='"version": ".*"'
NEW_BASE="\"version\": \"$NEW_VERSION\""

# Update version in manifest.json
sed -i '' "s|$OLD_BASE|$NEW_BASE|g" ./chrome-ext-files/manifest.json

# Update version in package.json
sed -i '' "s|$OLD_BASE|$NEW_BASE|g" ./package.json

if (lerna --version); then
  # Set the lerna packages versions as well
  lerna version $NEW_VERSION --force-publish=* --no-git-tag-version --no-push --yes;
fi
