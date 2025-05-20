#!/usr/bin/env node
/**
 * Generate a secure random string for use as NEXTAUTH_SECRET
 * Run this script with: bun src/scripts/generate-secret.js
 */

function generateSecureSecret(length = 32) {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('base64');
}

const secret = generateSecureSecret(32);
console.log('Generated NEXTAUTH_SECRET:');
console.log(secret);
console.log('\nAdd this to your environment variables:');
console.log(`NEXTAUTH_SECRET=${secret}`);

// If this script is run directly
if (require.main === module) {
  // Generate and display the secret
  console.log('\nRun this command to set it in your .env file:');
  console.log(`echo "NEXTAUTH_SECRET=${secret}" >> .env.local`);
} 