#!/bin/bash

# !!! TODO: Remove as deprecated
# Remove any electron-builds directory
# rm -rf electron-builds

# Create a new electron-builds directory
# mkdir electron-builds

# Build the angular app
# npm run build

# Fix the base href path for the electron app
# ./electron/fix-base-path.sh

# Make the electron apps
# npm run make
# npm run dist-electron

# Package the electron app
# ./node_modules/electron-packager/cli.js . Altair --out=electron-builds --overwrite --icon=electron/logo.icns

yarn lerna bootstrap

yarn lerna run --scope altair-electron build

# Snippet:
# Remove git tags
# git push --delete origin add-compilerc.11 add-compilerc.12 && git tag -d add-compilerc.11 add-compilerc.12
