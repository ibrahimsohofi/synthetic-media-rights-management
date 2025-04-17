import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that's right for your needs, from individual creators to large studios.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Free Tier */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                $0
                <span className="ml-1 text-2xl font-medium text-muted-foreground">/mo</span>
              </div>
              <CardDescription className="mt-4">
                Basic protection for individual creators just getting started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {['Register up to 10 creative works', 'Basic detection scans', 'Manual takedown tools', 'Community forums access'].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <div className="rounded-full bg-violet-500/10 p-1 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/register?plan=free">
                  Get Started
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Creator Tier */}
          <Card className="border-violet-600/50 shadow-lg shadow-violet-500/10 relative">
            <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-violet-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle>Creator</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                $49
                <span className="ml-1 text-2xl font-medium text-muted-foreground">/mo</span>
              </div>
              <CardDescription className="mt-4">
                Professional protection for serious creators and small teams.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Register up to 100 creative works',
                  'Weekly detection scans',
                  'Automated takedown system',
                  'Basic analytics dashboard',
                  'License template library',
                  'Priority support',
                  'Revenue tracking for licenses'
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <div className="rounded-full bg-violet-500/10 p-1 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/register?plan=creator">
                  Get Started
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Tier */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                $399
                <span className="ml-1 text-2xl font-medium text-muted-foreground">/mo</span>
              </div>
              <CardDescription className="mt-4">
                Comprehensive solution for studios and large creative teams.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Unlimited creative works',
                  'Daily detection scans',
                  'Advanced AI fingerprinting',
                  'Advanced analytics & reporting',
                  'Custom license creation',
                  'Dedicated account manager',
                  'API access',
                  'Custom integrations',
                  'Legal consultation hours',
                  'Multi-user team access'
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <div className="rounded-full bg-violet-500/10 p-1 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/register?plan=enterprise">
                  Contact Sales
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
          <p className="text-muted-foreground mb-8">
            Have more questions? Visit our <Link href="/faq" className="text-violet-600 hover:underline">FAQ page</Link> or <Link href="/contact" className="text-violet-600 hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
