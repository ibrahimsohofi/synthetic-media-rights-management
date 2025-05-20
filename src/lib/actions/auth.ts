"use server";

import { hash, compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { 
  registerSchema, 
  loginSchema, 
  resetPasswordRequestSchema,
  resetPasswordSchema,
  type RegisterResponse,
  type LoginResponse,
  type PasswordResetResponse,
  type EmailVerificationResponse
} from "@/lib/schemas/auth";
import { generateEmailVerificationToken, generatePasswordResetToken } from "@/lib/token-service";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email-service";

/**
 * Register a new user
 */
export async function registerUser(formData: FormData): Promise<RegisterResponse> {
  const rawFormData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Validate form data
  const validatedFields = registerSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const errorMessage = Object.values(errors).flat()[0] || "Invalid form data";
    return { success: false, message: errorMessage };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create username from email
    const username = email.split("@")[0].toLowerCase() + Math.floor(Math.random() * 1000);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        username,
      },
    });

    // Send verification email
    await sendVerificationEmailAction(user.id, email);

    // Redirect to login page
    redirect("/login?registered=true");

  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Failed to register user" };
  }
}

/**
 * Log in a user
 */
export async function loginUser(formData: FormData): Promise<LoginResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const code = formData.get("code") as string | undefined;

  try {
    // Validate credentials
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        passwordHash: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    const isValidPassword = await compare(password, user.passwordHash);

    if (!isValidPassword) {
      return { success: false, message: "Invalid email or password" };
    }

    // Handle 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!code) {
        return { success: false, message: "2FA code required" };
      }

      // Verify 2FA code
      const isValidCode = await verifyTwoFactorCode(user.id, code);
      if (!isValidCode) {
        return { success: false, message: "Invalid 2FA code" };
      }
    }

    // Check if already authenticated
    const session = await getServerSession(authOptions);
    if (session) {
      redirect("/dashboard");
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred during login" };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return { success: true, message: "If an account exists, you will receive a password reset email" };
    }

    // Generate reset token
    const token = await generatePasswordResetToken(user.id);

    // Send reset email
    await sendPasswordResetEmail(user.email, token);

    return { success: true, message: "Password reset email sent" };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { success: false, message: "Failed to send reset email" };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmailAction(userId: string, email: string): Promise<EmailVerificationResponse> {
  try {
    // Generate verification token
    const token = await generateEmailVerificationToken(userId, email);

    // Send verification email
    await sendVerificationEmail(email, token);

    return { success: true, message: "Verification email sent" };
  } catch (error) {
    console.error("Verification email error:", error);
    return { success: false, message: "Failed to send verification email" };
  }
}

/**
 * Verify 2FA code
 */
async function verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) {
      return false;
    }

    // Verify the code using the stored secret
    const isValid = await verifyTwoFactor(userId, code);
    return isValid.success;
  } catch (error) {
    console.error("2FA verification error:", error);
    return false;
  }
}
