"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield, AlertTriangle, BarChart2, FileText, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
}

function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent" : "transparent"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    title: "Threats",
    href: "/dashboard/threats",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center px-2">
                    <Shield className="mr-2 h-6 w-6" />
                    <span className="font-bold">Threat Analysis</span>
                  </div>
                  <SidebarNav items={sidebarNavItems} />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="flex items-center">
                <Shield className="mr-2 h-6 w-6" />
                <span className="font-bold">Threat Analysis</span>
              </div>
            </div>
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <ScrollArea className="h-full py-6 pr-6 lg:py-8">
            <SidebarNav items={sidebarNavItems} className="px-2" />
          </ScrollArea>
        </aside>

        {/* Page Content */}
        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
} 