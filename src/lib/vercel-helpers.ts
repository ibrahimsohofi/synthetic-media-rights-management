/**
 * Helper functions for Vercel deployment
 */

/**
 * Get the canonical URL for this site in various environments
 * This helps with NextAuth.js absolute URL requirements
 */
export function getVercelURL() {
  // Make sure NEXTAUTH_URL is always a string in Vercel environment
  const vercelUrl = process.env.VERCEL_URL;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const defaultUrl = 'http://localhost:3000';

  // If we detect we're in a Vercel environment
  if (vercelUrl) {
    // Ensure we're using https for production Vercel deployments
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${vercelUrl}`;
  }

  // Return explicitly set NEXTAUTH_URL if available
  if (nextAuthUrl && typeof nextAuthUrl === 'string') {
    return nextAuthUrl;
  }

  // Fallback to default
  return defaultUrl;
}

/**
 * Setup environment for Vercel at runtime
 * This ensures environment variables are correctly set
 */
export function setupVercelEnvironment() {
  // Force NEXTAUTH_URL to be a string on Vercel
  if (typeof process.env.NEXTAUTH_URL !== 'string') {
    process.env.NEXTAUTH_URL = getVercelURL();
    console.log('NEXTAUTH_URL set to:', process.env.NEXTAUTH_URL);
  }
} 