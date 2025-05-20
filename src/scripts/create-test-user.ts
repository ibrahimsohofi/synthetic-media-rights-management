import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

/**
 * This script creates a test user in the database
 * You can run it with: bun scripts/create-test-user.ts
 */
async function createTestUser() {
  try {
    // New test user credentials
    const email = "testuser@example.com";
    const password = "TestPassword123!";
    const hashedPassword = await hash(password, 10);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      console.log('You can login with:');
      console.log('Email:', email);
      console.log('Password: TestPassword123!');
      return existingUser;
    }
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        name: "Test User",
        username: "testuser2",
        passwordHash: hashedPassword,
        isEmailVerified: true
      }
    });
    
    console.log('Test user created successfully:');
    console.log({
      email: user.email,
      name: user.name,
      username: user.username
    });
    console.log('You can login with:');
    console.log('Email:', email);
    console.log('Password: TestPassword123!');
    
    return user;
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestUser(); 