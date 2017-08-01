#!/bin/bash

# Remove any electron-builds directory
rm -rf electron-builds

# Create a new electron-builds directory
mkdir electron-builds

# Build the angular app
npm run build

# Fix the base href path for the electron app
./electron/fix-base-path.sh

# Make the electron apps
npm run make

# Package the electron app
# ./node_modules/electron-packager/cli.js . Altair --out=electron-builds --overwrite --icon=electron/logo.icns