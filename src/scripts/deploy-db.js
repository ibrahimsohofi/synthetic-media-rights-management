// This script helps with database setup during deployment
const { execSync } = require('child_process');

console.log('Running database deployment script...');

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Run database migrations
  console.log('Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('Database setup completed successfully!');
} catch (error) {
  console.error('Error during database deployment:', error);
  process.exit(1);
} 