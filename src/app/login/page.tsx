"use client";
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { redirectIfAuthenticated } from "@/lib/auth-utils";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

interface SearchParams {
  registered?: string;
  error?: string;
  callbackUrl?: string;
}

export default async function LoginPage({
  searchParams = {} as SearchParams,
}: {
  searchParams: SearchParams;
}) {
  // Redirect if already authenticated
  await redirectIfAuthenticated();

  // Get params - use direct access without optional chaining
  const isRegistered = Boolean(searchParams.registered);
  const errorMessage = searchParams.error;
  const callbackUrl = searchParams.callbackUrl;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 bg-muted/30">
      <Link
        href="/"
        className="absolute top-8 left-8 inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:text-accent-foreground"
      >
        <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
        Back to Home
      </Link>

      <div className="mb-8 flex items-center gap-2">
        <div className="w-10 h-10 rounded-md bg-violet-600 flex items-center justify-center">
          <ShieldCheck className="text-white h-5 w-5" />
        </div>
        <span className="font-bold text-xl">SyntheticRights</span>
      </div>

      <Card className="mx-auto max-w-md w-full border-border/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your rights management dashboard
          </CardDescription>

          {isRegistered && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md mt-3 dark:bg-green-900/20 dark:text-green-400">
              Registration successful! You can now log in with your credentials.
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md mt-3 dark:bg-red-900/20 dark:text-red-400">
              {errorMessage === "CredentialsSignin" 
                ? "Invalid email or password."
                : errorMessage}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={callbackUrl} />
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
