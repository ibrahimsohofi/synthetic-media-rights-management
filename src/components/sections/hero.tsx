import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, FileCheck, Fingerprint } from "lucide-react";

export function HeroSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-violet-500/20 blur-[100px]" />

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-violet-500 text-white mb-6">
            <span>Introducing Rights Management 2.0</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-700">
            Protect Your Digital Identity in the AI Era
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The comprehensive platform for creators to register, protect, and monetize their likeness, voice,
            and creative style in the age of synthetic media.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/register">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-500" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-violet-500" />
              <span>100% legal compliance</span>
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-violet-500" />
              <span>Advanced biometric protection</span>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-12">
            <p className="text-xs text-muted-foreground mb-4">TRUSTED BY CREATORS WORLDWIDE</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-70">
              <div className="h-6 w-auto">Disney</div>
              <div className="h-6 w-auto">Universal</div>
              <div className="h-6 w-auto">Warner Bros</div>
              <div className="h-6 w-auto">Pixar</div>
              <div className="h-6 w-auto">Adobe</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
