import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { redirectIfAuthenticated } from "@/lib/auth-utils";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default async function ForgotPasswordPage() {
  // Redirect if already authenticated
  await redirectIfAuthenticated();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 bg-muted/30">
      <Link
        href="/login"
        className="absolute top-8 left-8 inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:text-accent-foreground"
      >
        <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
        Back to Login
      </Link>

      <div className="mb-8 flex items-center gap-2">
        <div className="w-10 h-10 rounded-md bg-violet-600 flex items-center justify-center">
          <ShieldCheck className="text-white h-5 w-5" />
        </div>
        <span className="font-bold text-xl">SyntheticRights</span>
      </div>

      <ForgotPasswordForm />
    </div>
  );
} 