import { prisma } from "@/lib/prisma"; 
import { hash } from "bcrypt";

/**
 * This script creates or resets the admin user
 */
async function resetAdmin() {
  try {
    const email = "admin@example.com";
    const password = "Admin123!";
    const passwordHash = await hash(password, 10);

    console.log("Checking if admin user exists...");
    
    // Try to find the user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Update existing user
      console.log("Admin user exists, updating password...");
      
      const updated = await prisma.user.update({
        where: { email },
        data: { 
          passwordHash,
          isEmailVerified: true
        }
      });
      
      console.log("Admin user updated:", updated.email);
    } else {
      // Create new user
      console.log("Creating new admin user...");
      
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: "Administrator",
          username: "admin",
          isEmailVerified: true
        }
      });
      
      console.log("Admin user created:", user.email);
    }
    
    console.log("\nLogin with:");
    console.log("Email:", email);
    console.log("Password:", password);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
resetAdmin(); 