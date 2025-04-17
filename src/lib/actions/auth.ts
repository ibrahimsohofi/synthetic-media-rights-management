"use server";

import { z } from "zod";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";

// Schema for registration validation
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(async (data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Type for registration response
type RegisterResponse = {
  success: boolean;
  message: string;
};

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
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        username,
      },
    });

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
export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if ((error as Error).message.includes("CredentialsSignin")) {
      return { success: false, message: "Invalid email or password" };
    }
    throw error;
  }
}
