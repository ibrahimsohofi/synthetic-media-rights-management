import { execSync } from 'child_process';
import { hash } from 'bcrypt';

/**
 * This script creates a test user directly in the database using SQL
 * to bypass any potential Prisma issues
 */
async function createTestUserDirect() {
  try {
    // New user credentials
    const email = 'admin@example.com';
    const password = 'Admin123!';
    const username = 'admin';
    const name = 'Admin User';
    
    // Hash the password
    const passwordHash = await hash(password, 10);
    
    // Create the SQL for inserting the user
    const sql = `
    INSERT INTO User (id, email, passwordHash, name, username, isEmailVerified, createdAt, updatedAt)
    VALUES (uuid(), '${email}', '${passwordHash}', '${name}', '${username}', 1, datetime('now'), datetime('now'))
    ON CONFLICT(email) DO NOTHING;
    `;
    
    // Create a temporary SQL file
    const fs = require('fs');
    fs.writeFileSync('temp_sql.sql', sql);
    
    // Execute the SQL
    console.log('Executing SQL to create admin user...');
    console.log('SQL:', sql);
    
    // Assuming SQLite database
    const dbPath = './prisma/dev.db';
    execSync(`sqlite3 ${dbPath} ".read temp_sql.sql"`);
    
    // Clean up
    fs.unlinkSync('temp_sql.sql');
    
    console.log('Admin user created or already exists!');
    console.log('You can now log in with:');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Run the function
createTestUserDirect(); 