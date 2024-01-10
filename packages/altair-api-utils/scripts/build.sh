#!/bin/bash

set -e


SCRIPT_DIR=$(dirname "$0")
API_UTILS_ROOT=$(cd "$SCRIPT_DIR/../" && pwd)/
cd "$API_UTILS_ROOT"

# Build the package
yarn tsc --build

# Replace process.env variables with actual values in the build directory
# Iterate over each JavaScript file in the input directory
for file in build/*.js; do
  # Replace process.env.VARIABLE_NAME with the actual environment variable value
  sed -i '' 's/process\.env\.([A-Za-z0-9_]+)/\"\${\1:-}\"/g' "$file" > "$file"
done
echo "Replaced process.env variables with actual values in the build directory"