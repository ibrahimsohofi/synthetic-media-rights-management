import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirectIfAuthenticated } from "@/lib/auth-utils";
import { registerUser } from "@/lib/actions/auth";
import { ShieldCheck, User, Mail, Lock, ArrowRight } from "lucide-react";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // Redirect if already authenticated
  await redirectIfAuthenticated();

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
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Sign up to manage and protect your creative works
          </CardDescription>

          {searchParams.error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md mt-3 dark:bg-red-900/20 dark:text-red-400">
              {searchParams.error}
            </div>
          )}
        </CardHeader>
        <form action={registerUser}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  required
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full mb-4">
              Create Account
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
