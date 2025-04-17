import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-violet-600 flex items-center justify-center">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">SyntheticRights</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/rights-registry" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Rights Registry
          </Link>
          <Link href="/licensing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Licensing
          </Link>
          <Link href="/detection" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Detection
          </Link>
          <Link href="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Marketplace
          </Link>
        </nav>

        {/* Auth Buttons & Mobile Menu */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/rights-registry" className="text-sm font-medium hover:text-primary transition-colors">
                  Rights Registry
                </Link>
                <Link href="/licensing" className="text-sm font-medium hover:text-primary transition-colors">
                  Licensing
                </Link>
                <Link href="/detection" className="text-sm font-medium hover:text-primary transition-colors">
                  Detection
                </Link>
                <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">
                  Marketplace
                </Link>
                <div className="flex flex-col gap-2 mt-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
