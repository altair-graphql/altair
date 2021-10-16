#!/bin/bash

if [ -z "$1" ]
  then
    echo "No version supplied."
    exit 1
fi

NEW_VERSION=$1
OLD_BASE='"version": ".*"'
NEW_BASE="\"version\": \"$NEW_VERSION\""

CWEX_OLD_BASE=' version: .*'
CWEX_NEW_BASE=" version: $NEW_VERSION"

XML_OLD_BASE='<version>.*</version>'
XML_NEW_BASE="<version>$NEW_VERSION</version>"

PS1_OLD_BASE='altair_.*_x64_win'
PS1_NEW_BASE="altair_${NEW_VERSION}_x64_win"

VERSION_OLD_BASE='.*'
VERSION_NEW_BASE=$NEW_VERSION

# Update version in VERSION file
sed -i '' "s|$VERSION_OLD_BASE|$VERSION_NEW_BASE|g" ./VERSION

# Update version in manifest.json
sed -i '' "s|$OLD_BASE|$NEW_BASE|g" ./chrome-ext-files/manifest.json

# Update version in package.json
sed -i '' "s|$OLD_BASE|$NEW_BASE|g" ./package.json

# Update version in cwex.yml
sed -i '' "s|$CWEX_OLD_BASE|$CWEX_NEW_BASE|g" ./cwex.yml

# Update version in altair-graphql.nuspec
sed -i '' "s|$XML_OLD_BASE|$XML_NEW_BASE|g" ./chocolatey/altair-graphql.nuspec

# Update version in altair-graphql.nuspec
sed -i '' "s|$PS1_OLD_BASE|$PS1_NEW_BASE|g" ./chocolatey/tools/chocolateyInstall.ps1

if (lerna --version); then
  # Set the lerna packages versions as well
  lerna version $NEW_VERSION --force-publish=* --no-git-tag-version --no-push --yes;
fi
