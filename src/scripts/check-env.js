#!/usr/bin/env node
/**
 * Script to check environment variables
 * Run with: bun src/scripts/check-env.js
 */

console.log('=== Environment Variables Check ===\n');

const requiredVars = [
  { name: 'NEXTAUTH_URL', defaultValue: 'http://localhost:3000' },
  { name: 'NEXTAUTH_SECRET', required: true },
  { name: 'DATABASE_URL', required: true },
  { name: 'UPSTASH_REDIS_REST_URL', required: false },
  { name: 'UPSTASH_REDIS_REST_TOKEN', required: false }
];

let hasErrors = false;

for (const variable of requiredVars) {
  const value = process.env[variable.name];
  
  if (!value && variable.required) {
    console.log(`❌ ${variable.name}: Missing (Required)`);
    hasErrors = true;
  } else if (!value && variable.defaultValue) {
    console.log(`⚠️ ${variable.name}: Missing (Default: ${variable.defaultValue})`);
  } else if (!value) {
    console.log(`⚠️ ${variable.name}: Missing (Optional)`);
  } else {
    // Only show first few and last few characters of secrets
    const isSecret = variable.name.includes('SECRET') || variable.name.includes('TOKEN');
    const displayValue = isSecret 
      ? `${value.substring(0, 3)}...${value.substring(value.length - 3)}`
      : value;
    
    console.log(`✅ ${variable.name}: ${displayValue}`);
  }
}

if (hasErrors) {
  console.log('\n❌ Some required environment variables are missing!');
  console.log('Please set them in your .env.local file or deployment platform.');
} else {
  console.log('\n✅ All required environment variables are set!');
}

// Check NODE_ENV
console.log(`\nCurrent environment: ${process.env.NODE_ENV || 'development'}`);

// Output NextAuth URL specifically for debugging
console.log(`\nNEXTAUTH_URL check:`);
const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
console.log(`- Value: ${nextAuthUrl}`);
console.log(`- Type: ${typeof nextAuthUrl}`);
console.log(`- Empty check: ${nextAuthUrl ? 'Not empty' : 'Empty'}`);
console.log(`- Valid URL check: ${isValidUrl(nextAuthUrl) ? 'Valid URL' : 'Invalid URL'}`);

// Function to validate URL
function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
} 