#!/usr/bin/env node
/**
 * This script helps set up the production database
 * Run with: bun src/scripts/setup-production-db.js
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('=== Production Database Setup ===\n');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log('WARNING: DATABASE_URL environment variable is not set.');
    console.log('You will need to set this to point to your production database.\n');
    
    const dbUrl = await ask('Enter your production DATABASE_URL (or press Enter to skip): ');
    if (dbUrl) {
      process.env.DATABASE_URL = dbUrl;
      
      // Add to .env file if user wants
      const addToEnv = await ask('Add this URL to .env.local file? (y/n): ');
      if (addToEnv.toLowerCase() === 'y') {
        try {
          fs.appendFileSync('.env.local', `\nDATABASE_URL="${dbUrl}"\n`);
          console.log('Added to .env.local file');
        } catch (error) {
          console.error('Error adding to .env file:', error);
        }
      }
    } else {
      console.log('Skipping DATABASE_URL setup. You will need to set this later.');
    }
  }
  
  // Check if we should update schema.prisma
  console.log('\n=== Database Provider Setup ===');
  console.log('For production, PostgreSQL is recommended over SQLite.');
  const updateProvider = await ask('Update schema.prisma to use PostgreSQL? (y/n): ');
  
  if (updateProvider.toLowerCase() === 'y') {
    try {
      // Read current schema
      const schemaPath = './prisma/schema.prisma';
      let schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Replace provider
      schema = schema.replace(
        /provider\s*=\s*"sqlite"/,
        'provider = "postgresql"'
      );
      
      // Write back to file
      fs.writeFileSync(schemaPath, schema);
      console.log('Updated schema.prisma to use PostgreSQL');
    } catch (error) {
      console.error('Error updating schema.prisma:', error);
    }
  }
  
  // Run Prisma commands
  try {
    console.log('\n=== Running Prisma Commands ===');
    
    const runCommand = await ask('Generate new migration for production? (y/n): ');
    if (runCommand.toLowerCase() === 'y') {
      const migrationName = await ask('Enter migration name: ');
      console.log('\nGenerating migration...');
      execSync(`npx prisma migrate dev --name ${migrationName || 'production-setup'}`, {
        stdio: 'inherit'
      });
    } else {
      console.log('Skipping migration generation');
    }
    
    console.log('\nGenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('\n=== Setup Complete ===');
    console.log('Before deploying:');
    console.log('1. Make sure your DATABASE_URL is correctly set in your deployment environment');
    console.log('2. Commit the new Prisma migration files to your repository');
    console.log('3. The build command will run the migrations automatically on deployment');
  } catch (error) {
    console.error('Error running Prisma commands:', error);
  }
  
  rl.close();
}

main(); 