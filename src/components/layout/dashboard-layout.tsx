import type { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileCheck,
  Search,
  Wallet,
  Settings,
  Shield,
  LineChart,
  MessageSquare,
  HelpCircle,
  LogOut,
  Menu,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { LanguageSwitcher } from "@/components/ui/language-switcher"; // Added language switcher import

interface DashboardLayoutProps {
  children: ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Get the current user
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Create avatar fallback from user's name or email
  const getAvatarFallback = () => {
    if (user.name) {
      return user.name.split(" ").map(part => part[0]).join("").toUpperCase();
    }
    return user.email?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">SyntheticRights</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground mb-3 pl-3">MANAGEMENT</p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                item.active && "bg-accent text-accent-foreground font-medium"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <p className="text-xs font-semibold text-muted-foreground mb-3 mt-6 pl-3">SETTINGS</p>
          {settingsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                item.active && "bg-accent text-accent-foreground font-medium"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {/* New Rights Registry section */}
          <p className="text-xs font-semibold text-muted-foreground mb-3 mt-6 pl-3">RIGHTS REGISTRY</p>
          {rightsRegistryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              )}
            >
              <FileCheck className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.image || ""} alt={user.name || "User avatar"} />
              <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header and Navigation */}
      <div className="flex flex-col flex-1">
        <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
          <div className="flex items-center h-16 px-4 gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-lg">SyntheticRights</span>
                  </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 pl-3">MANAGEMENT</p>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                        item.active && "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}

                  <p className="text-xs font-semibold text-muted-foreground mb-3 mt-6 pl-3">SETTINGS</p>
                  {settingsItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                        item.active && "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="p-4 border-t mt-auto">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.image || ""} alt={user.name || "User avatar"} />
                      <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-violet-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">SyntheticRights</span>
            </Link>

            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher /> {/* Added LanguageSwitcher component */}
              {/* Replace the old notification button with our new component */}
              <NotificationDropdown />

              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || ""} alt={user.name || "User avatar"} />
                <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    active: true,
  },
  {
    label: "Rights Registry",
    href: "/dashboard/rights-registry",
    icon: <Shield className="h-4 w-4" />,
    active: false,
  },
  {
    label: "Licensing",
    href: "/dashboard/licensing",
    icon: <FileCheck className="h-4 w-4" />,
    active: false,
  },
  {
    label: "Detection",
    href: "/dashboard/detection",
    icon: <Search className="h-4 w-4" />,
    active: false,
  },
  {
    label: "Marketplace",
    href: "/dashboard/marketplace",
    icon: <Wallet className="h-4 w-4" />,
    active: false,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: <LineChart className="h-4 w-4" />,
    active: false,
  },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: <Users className="h-4 w-4" />,
    active: false,
  }
];

const settingsItems = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-4 w-4" />,
    active: false,
  },
  {
    label: "Help & Support",
    href: "/dashboard/support",
    icon: <HelpCircle className="h-4 w-4" />,
    active: false,
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: <MessageSquare className="h-4 w-4" />,
    active: false,
  },
  {
    label: "Log Out",
    href: "/api/auth/signout",
    icon: <LogOut className="h-4 w-4" />,
    active: false,
  }
];

// New Rights Registry items
const rightsRegistryItems = [
  {
    name: "Overview",
    href: "/dashboard/rights-registry",
  },
  {
    name: "Register New Work",
    href: "/dashboard/rights-registry/register",
  },
  {
    name: "Manage Certificates",
    href: "/dashboard/rights-registry/certificates",
  },
  {
    name: "Batch Generation",
    href: "/dashboard/rights-registry/certificates/batch",
  },
  {
    name: "Certificate Showcase",
    href: "/dashboard/rights-registry/certificates/showcase",
  },
];
