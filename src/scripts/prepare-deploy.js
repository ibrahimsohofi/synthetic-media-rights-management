#!/usr/bin/env node
/**
 * Deployment preparation script
 * Run with: bun src/scripts/prepare-deploy.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, errorMessage) {
  try {
    log(`Running: ${command}`, colors.cyan);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`ERROR: ${errorMessage || error.message}`, colors.red);
    return false;
  }
}

function checkFile(filePath, errorMessage) {
  if (!fs.existsSync(filePath)) {
    log(`ERROR: ${errorMessage || `File not found: ${filePath}`}`, colors.red);
    return false;
  }
  return true;
}

// Main deployment preparation function
async function prepareForDeployment() {
  log('=== Preparing for Deployment ===', colors.green);
  
  // Check if git is clean
  try {
    const status = execSync('git status --porcelain').toString();
    if (status.trim() !== '') {
      log('WARNING: You have uncommitted changes. Consider committing before deploying.', colors.yellow);
    }
  } catch (error) {
    log('Git not found or not a git repository. Skipping git check.', colors.yellow);
  }
  
  // Lint and check TypeScript
  log('\n1. Running linting and type checking...', colors.green);
  runCommand('npm run lint', 'Linting failed. Fix the issues before deploying.');
  
  // Generate Prisma client
  log('\n2. Generating Prisma client...', colors.green);
  if (!runCommand('npx prisma generate', 'Failed to generate Prisma client.')) {
    return;
  }
  
  // Create production build
  log('\n3. Creating production build...', colors.green);
  if (!runCommand('npm run build', 'Build failed.')) {
    return;
  }
  
  // Check required deployment files
  log('\n4. Checking deployment configuration files...', colors.green);
  const requiredFiles = [
    { path: 'vercel.json', description: 'Vercel configuration' },
    { path: 'netlify.toml', description: 'Netlify configuration' },
    { path: 'prisma/schema.prisma', description: 'Prisma schema' }
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    if (checkFile(file.path)) {
      log(`✓ ${file.description} found`, colors.green);
    } else {
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    log('Some required files are missing. See errors above.', colors.red);
  }
  
  // Generate deployment secret key
  log('\n5. Generating deployment secret...', colors.green);
  const crypto = require('crypto');
  const secret = crypto.randomBytes(32).toString('base64');
  log(`NEXTAUTH_SECRET=${secret}`, colors.cyan);
  log('Copy this secret to your deployment environment variables.', colors.yellow);
  
  // Final instructions
  log('\n=== Deployment Ready ===', colors.green);
  log('Your application is ready for deployment!', colors.green);
  log('\nRemember to set these environment variables in your deployment platform:', colors.yellow);
  log('- NEXTAUTH_SECRET (generated above)', colors.yellow);
  log('- NEXTAUTH_URL (your deployment URL)', colors.yellow);
  log('- DATABASE_URL (your database connection string)', colors.yellow);
  log('- UPSTASH_REDIS_REST_URL (if using Redis)', colors.yellow);
  log('- UPSTASH_REDIS_REST_TOKEN (if using Redis)', colors.yellow);
  
  log('\nSee DEPLOYMENT.md for detailed deployment instructions.', colors.cyan);
}

// Run the preparation function
prepareForDeployment(); 