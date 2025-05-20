#!/usr/bin/env node
/**
 * Generate Vercel environment variables
 * Run with: bun src/scripts/vercel-env-setup.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a secure NEXTAUTH_SECRET
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

// Main function
async function setupVercelEnv() {
  console.log('=== Vercel Environment Setup ===\n');
  
  // Generate NEXTAUTH_SECRET
  const secret = generateSecret();
  
  // Create content for Vercel environment variables
  const vercelEnvContent = `
# NextAuth Configuration
NEXTAUTH_SECRET="${secret}"

# Vercel will automatically set the deployment URL
# No need to explicitly set NEXTAUTH_URL in Vercel
  
# Database Configuration - Replace with your production database
DATABASE_URL=""

# Redis Configuration (if using)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
`;

  // Write to .env.vercel file
  try {
    fs.writeFileSync('.env.vercel', vercelEnvContent.trim());
    console.log('✅ Created .env.vercel file with environment variables for Vercel deployment');
    
    // Display import command for Vercel CLI
    console.log('\nTo import these variables to Vercel, run:');
    console.log('vercel env import .env.vercel');
    
    // Display manual setup instructions
    console.log('\nOr set these variables manually in the Vercel dashboard:');
    console.log(`NEXTAUTH_SECRET="${secret}"`);
    console.log('DATABASE_URL="your-production-database-url"');
  } catch (error) {
    console.error('Error creating .env.vercel file:', error);
  }
  
  console.log('\nIMPORTANT: Do not commit the .env.vercel file to your repository!');
  console.log('Add it to .gitignore if it\'s not already there.');
}

// Run the script
setupVercelEnv(); 