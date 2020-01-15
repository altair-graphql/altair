#!/bin/bash

# Remove any chrome-extension directory
rm -rf chrome-extension

# Remove any web ext artifacts directory
rm -rf web-ext-artifacts

# Remove any altair.zip files
rm altair.zip

# Create a new chrome-extension directory
mkdir chrome-extension

# Copy the files from the dist folder into the chrome-extension directory
cp -r packages/altair-app/dist/* chrome-extension


sed -i '' "s|</body>|<script src='js/init.js'></script></body>|g" ./chrome-extension/index.html

# Copy the chrome extension specific files into the chrome-extension directory
cp -r chrome-ext-files/* chrome-extension

# Remove all sourcemap files from the chrome-extension directory
find chrome-extension -name '*.map' -type f -delete

# Remove all .DS_Store files from the chrome-extension directory
find chrome-extension -name '.DS_Store' -type f -delete

# Remove all stats.json files from the chrome-extension directory
find chrome-extension -name 'stats.json' -type f -delete

# Remove all readme image assets
echo 'Removing readme image assets...'
rm -rf chrome-extension/assets/img/readme/

# Compress the chrome-extension directory into a zip file
zip -r altair.zip chrome-extension

# Build the extension for firefox
./node_modules/web-ext/bin/web-ext build --source-dir chrome-extension --overwrite-dest

