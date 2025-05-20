'use server';

import bcrypt from 'bcrypt';
import { auth } from "./auth";

/**
 * Server action to verify credentials
 * This isolates bcrypt to server-side code
 */
export async function verifyCredentials(email: string, password: string) {
  try {
    // Find user in database
    const { prisma } = await import('./prisma');
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log("No user found with email:", email);
      return null;
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordValid) {
      console.log("Invalid password for user:", email);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
    };
  } catch (error) {
    console.error("Error in verifyCredentials:", error);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getServerSession() {
  return await auth();
} 