import type { Metadata } from "next";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Search, BookOpen, Layers, Database, Shield, FileCheck, Code, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation | SyntheticRights",
  description: "Browse our comprehensive documentation for synthetic media rights management",
};

// Types for documentation data
interface DocumentItem {
  id: string;
  title: string;
  description: string;
  path: string;
  category: string;
  tags: string[];
  icon: React.ReactNode;
  popular?: boolean;
  updated?: string;
}

export default function DocumentationPage() {
  // Categorized documentation data
  const documentItems: DocumentItem[] = [
    // Getting Started
    {
      id: "getting-started-guide",
      title: "Getting Started with SyntheticRights",
      description: "A complete guide to using the platform for the first time",
      path: "/dashboard/support/articles/getting-started",
      category: "Getting Started",
      tags: ["Beginner", "Overview", "Tutorial"],
      icon: <BookOpen className="h-5 w-5 text-violet-500" />,
      popular: true,
      updated: "2 days ago"
    },
    {
      id: "platform-overview",
      title: "Platform Overview",
      description: "Explore the key features and components of SyntheticRights",
      path: "/dashboard/support/articles/platform-overview",
      category: "Getting Started",
      tags: ["Features", "Navigation", "Dashboard"],
      icon: <Layers className="h-5 w-5 text-violet-500" />,
      popular: true
    },
    {
      id: "account-setup",
      title: "Account Setup and Security",
      description: "Configure your account settings and security options",
      path: "/dashboard/support/articles/account-setup",
      category: "Getting Started",
      tags: ["Security", "Settings", "Profile"],
      icon: <Shield className="h-5 w-5 text-violet-500" />
    },

    // Rights Registration
    {
      id: "registration-process",
      title: "Rights Registration Process Explained",
      description: "Step-by-step guide to registering your synthetic media rights",
      path: "/dashboard/support/articles/registration-process",
      category: "Rights Registration",
      tags: ["Registration", "Ownership", "Process"],
      icon: <FileCheck className="h-5 w-5 text-green-500" />,
      popular: true
    },
    {
      id: "blockchain-verification",
      title: "Blockchain Verification for Synthetic Media",
      description: "How our blockchain technology secures and proves your media ownership",
      path: "/dashboard/support/articles/blockchain-verification",
      category: "Rights Registration",
      tags: ["Blockchain", "Verification", "Security"],
      icon: <Database className="h-5 w-5 text-green-500" />,
      updated: "5 days ago"
    },
    {
      id: "metadata-hash",
      title: "Understanding Metadata Hash Generation",
      description: "Technical details on how unique content identifiers are created",
      path: "/dashboard/support/articles/metadata-hash",
      category: "Rights Registration",
      tags: ["Technical", "Metadata", "Hashing"],
      icon: <Code className="h-5 w-5 text-green-500" />
    },

    // Detection & Enforcement
    {
      id: "detection-technology",
      title: "Detection Technology",
      description: "How our system identifies your media across the internet",
      path: "/dashboard/support/articles/detection-technology",
      category: "Detection & Enforcement",
      tags: ["AI", "Scanning", "Matching"],
      icon: <Search className="h-5 w-5 text-blue-500" />,
      popular: true
    },
    {
      id: "violation-handling",
      title: "Handling Rights Violations",
      description: "Steps to take when unauthorized usage is detected",
      path: "/dashboard/support/articles/violation-handling",
      category: "Detection & Enforcement",
      tags: ["Enforcement", "Takedown", "DMCA"],
      icon: <Shield className="h-5 w-5 text-blue-500" />
    },

    // Licensing
    {
      id: "license-types",
      title: "Understanding License Types",
      description: "Different licensing options for your synthetic media",
      path: "/dashboard/support/articles/license-types",
      category: "Licensing",
      tags: ["Licensing", "Rights", "Commercial"],
      icon: <FileText className="h-5 w-5 text-amber-500" />
    },
    {
      id: "license-creation",
      title: "Creating Custom Licenses",
      description: "How to set up licenses tailored to your specific requirements",
      path: "/dashboard/support/articles/license-creation",
      category: "Licensing",
      tags: ["Licensing", "Customization", "Terms"],
      icon: <FileText className="h-5 w-5 text-amber-500" />
    },

    // Technical Guides
    {
      id: "api-integration",
      title: "API Integration Guide",
      description: "Integrate SyntheticRights features into your own applications",
      path: "/dashboard/support/articles/api-integration",
      category: "Technical Guides",
      tags: ["API", "Integration", "Developer"],
      icon: <Code className="h-5 w-5 text-slate-500" />
    },
    {
      id: "bulk-registration",
      title: "Bulk Media Registration",
      description: "Efficiently register multiple media files at once",
      path: "/dashboard/support/articles/bulk-registration",
      category: "Technical Guides",
      tags: ["Batch", "Upload", "Efficiency"],
      icon: <Layers className="h-5 w-5 text-slate-500" />
    }
  ];

  // Group documents by category
  const categories = [...new Set(documentItems.map(item => item.category))];

  // Get popular documents
  const popularDocuments = documentItems.filter(item => item.popular);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Explore our guides and tutorials to get the most out of SyntheticRights
          </p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            className="pl-10"
          />
        </div>

        {/* Popular Articles */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularDocuments.map(doc => (
              <Link key={doc.id} href={doc.path} className="block group">
                <Card className="h-full hover:border-violet-200 hover:shadow-sm transition-all">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start gap-3">
                      {doc.icon}
                      <CardTitle className="text-base group-hover:text-violet-600 transition-colors">
                        {doc.title}
                      </CardTitle>
                    </div>
                    {doc.updated && (
                      <Badge variant="outline" className="text-xs mt-2 w-fit">Updated {doc.updated}</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <CardDescription>
                      {doc.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* All documentation with tabs by category */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
          <Tabs defaultValue={categories[0]}>
            <TabsList className="mb-4 flex flex-wrap h-auto">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="h-9">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentItems
                    .filter(item => item.category === category)
                    .map(doc => (
                      <Link key={doc.id} href={doc.path} className="block group">
                        <Card className="h-full hover:border-violet-200 hover:shadow-sm transition-all">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-start gap-3">
                              {doc.icon}
                              <div>
                                <CardTitle className="text-base group-hover:text-violet-600 transition-colors">
                                  {doc.title}
                                </CardTitle>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {doc.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <CardDescription>
                              {doc.description}
                            </CardDescription>
                          </CardContent>
                          <CardFooter className="p-4 pt-0">
                            <Button variant="ghost" size="sm" className="text-xs gap-1">
                              Read article <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </div>
    </DashboardLayout>
  );
}
