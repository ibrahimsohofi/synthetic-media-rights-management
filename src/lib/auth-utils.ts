import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session on the server
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Check if a user is authenticated
 * @returns boolean indicating if the user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Require authentication for a route
 * @param redirectTo - Where to redirect if not authenticated
 */
export async function requireAuth(redirectTo = "/login") {
  const isAuthed = await isAuthenticated();

  if (!isAuthed) {
    redirect(redirectTo);
  }
}

/**
 * Redirect if already authenticated
 * @param redirectTo - Where to redirect if authenticated
 */
export async function redirectIfAuthenticated(redirectTo = "/dashboard") {
  const isAuthed = await isAuthenticated();

  if (isAuthed) {
    redirect(redirectTo);
  }
}
