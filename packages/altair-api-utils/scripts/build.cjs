const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * SCRIPT_DIR=$(dirname "$0")
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
 */

const API_UTILS_ROOT = path.resolve(__dirname, '../');
const BUILD_DIR = path.join(API_UTILS_ROOT, 'build');

// Build the package
execSync('yarn tsc --build', { cwd: API_UTILS_ROOT, stdio: 'inherit' });

// Replace process.env variables with actual values in the build directory
// Iterate over each JavaScript file in the input directory
fs.readdirSync(BUILD_DIR).forEach((file) => {
  const filePath = path.join(BUILD_DIR, file);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const replacedContents = fileContents.replace(
    /process\.env\.([A-Za-z0-9_]+)/g,
    (_, p1) => {
      if (!process.env[p1]) {
        return `undefined`;
      }
      return `"${process.env[p1]}"`;
    }
  );
  fs.writeFileSync(filePath, replacedContents, 'utf8');
});
