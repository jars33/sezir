
#!/usr/bin/env node

/**
 * This file is a workaround since we can't modify package.json directly.
 * Run this script with:
 * node src/scripts/run-tests.js
 */
const { execSync } = require('child_process');

// Run Jest with the following options
try {
  console.log('Running tests...');
  execSync('npx jest', { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}
