import Link from "next/link";
import { ShieldCheck, Twitter, Linkedin, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and company info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center">
                <ShieldCheck className="text-white h-4 w-4" />
              </div>
              <span className="font-bold text-lg">SyntheticRights</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Protecting creator rights in the age of synthetic media and AI-generated content.
            </p>
            <div className="flex items-center gap-3">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/rights-registry" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Rights Registry
                </Link>
              </li>
              <li>
                <Link href="/licensing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Licensing
                </Link>
              </li>
              <li>
                <Link href="/detection" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Detection
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Partners
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section with legal links and copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-border/40">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-4 md:mb-0">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
            <Link href="/compliance" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Compliance
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SyntheticRights. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
