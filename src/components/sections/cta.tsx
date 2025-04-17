import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,#000_70%,transparent_110%)]" />

      <div className="container">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-2xl p-8 md:p-12 lg:p-16 backdrop-blur-sm border border-violet-200/30 dark:border-violet-800/30 shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to Protect Your Creative Identity?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of creators who have already secured their digital likeness and style in the era of AI-generated content.
            </p>

            <div className="space-y-4">
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link href="/register">
                  Get Started Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <p className="text-sm text-muted-foreground">
                No credit card required. Start with our free tier.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">50K+</span>
                <span className="text-sm text-muted-foreground">Creators Protected</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">150M+</span>
                <span className="text-sm text-muted-foreground">Assets Registered</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">95%</span>
                <span className="text-sm text-muted-foreground">Detection Accuracy</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">$25M+</span>
                <span className="text-sm text-muted-foreground">Creator Royalties</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
