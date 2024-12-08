const path = require('path');
const { execSync } = require('child_process');

const API_UTILS_ROOT = path.resolve(__dirname, '../');

// Build the package
execSync('pnpm tsc --build', { cwd: API_UTILS_ROOT, stdio: 'inherit' });
