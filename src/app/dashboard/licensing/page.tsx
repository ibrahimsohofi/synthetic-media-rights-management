import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  FileCheck,
  PlusCircle,
  Clock,
  DollarSign,
  Download,
  Copy,
  ExternalLink,
  Users,
  LayoutGrid,
  List
} from "lucide-react";
import Link from "next/link";

export default function LicensingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">License Management</h1>
            <p className="text-muted-foreground">
              Create and manage licenses for your creative works.
            </p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/licensing/create">
              <PlusCircle className="h-4 w-4" /> Create New License
            </Link>
          </Button>
        </div>

        {/* License Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">42</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                  In good standing
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                +5 new in the last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">$2,489</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30">
                  This quarter
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                +$347 from last quarter
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Works Licensed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">24</span>
                <Badge variant="outline">
                  Of 127 total works
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                18.9% of your portfolio is licensed
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">License Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">6</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30">
                  Coming up
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Due in the next 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* License Management */}
        <Tabs defaultValue="active" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="active" className="gap-2">
                <FileCheck className="h-4 w-4" /> Active
              </TabsTrigger>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" /> Pending
              </TabsTrigger>
              <TabsTrigger value="expired" className="gap-2">
                <FileCheck className="h-4 w-4" /> Expired
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <Copy className="h-4 w-4" /> Templates
              </TabsTrigger>
            </TabsList>

            {/* View Options */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search licenses..."
                className="pl-8 w-full"
              />
            </div>
            <div className="flex gap-3">
              <Select>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All work types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All work types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </div>
          </div>

          <TabsContent value="active">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Active Licenses (42)</CardTitle>
                <CardDescription>
                  Licenses that are currently in effect for your creative works.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {activeLicenses.map((license) => (
                    <div key={license.id} className="border rounded-lg p-4 bg-card">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-medium">{license.title}</h3>
                            <Badge variant="outline" className={`
                              ${license.type === 'commercial' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30' : ''}
                              ${license.type === 'exclusive' ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/30' : ''}
                              ${license.type === 'limited' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30' : ''}
                            `}>
                              {license.type} license
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Licensed to: <span className="font-medium">{license.licensee}</span>
                          </p>
                          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mb-3">
                            <span>Work: {license.work}</span>
                            <span>Created: {license.created}</span>
                            <span>Expires: {license.expires}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <Badge variant="secondary" className="gap-1">
                            <DollarSign className="h-3 w-3" /> {license.revenue}
                          </Badge>
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-wrap gap-4 justify-between">
                          <div className="flex gap-1 items-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {license.permissions}
                            </span>
                          </div>

                          <div className="space-y-1 max-w-xs w-full">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">License period</span>
                              <span>{license.progress}%</span>
                            </div>
                            <Progress value={license.progress} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-end space-x-2 mt-6">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="px-4 hover:bg-violet-50 dark:hover:bg-violet-900/20">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="px-4">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="px-4">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Pending Licenses</CardTitle>
                <CardDescription>
                  Licenses that are awaiting approval or signature.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">Pending Licenses UI</h3>
                    <p className="text-muted-foreground max-w-md">
                      This tab would display licenses that are currently in negotiation, awaiting
                      signature, or pending approval by either party.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expired">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Expired Licenses</CardTitle>
                <CardDescription>
                  Licenses that have expired and may be eligible for renewal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <FileCheck className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">Expired Licenses UI</h3>
                    <p className="text-muted-foreground max-w-md">
                      This tab would display expired licenses with options to renew, along with
                      historical performance data and suggested terms for renewal.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>License Templates</CardTitle>
                <CardDescription>
                  Pre-defined license templates to streamline the licensing process.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <Copy className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">License Templates UI</h3>
                    <p className="text-muted-foreground max-w-md">
                      This tab would display reusable license templates for different use cases
                      (commercial, personal, AI training, derivative works, etc.) with the ability to customize terms.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Sample data
interface LicenseData {
  id: string;
  title: string;
  type: 'commercial' | 'exclusive' | 'limited';
  licensee: string;
  work: string;
  created: string;
  expires: string;
  revenue: string;
  permissions: string;
  progress: number;
}

const activeLicenses: LicenseData[] = [
  {
    id: '1',
    title: 'Commercial Usage License',
    type: 'commercial',
    licensee: 'Acme Marketing Agency',
    work: 'Character Design - Hero Series',
    created: 'Jan 15, 2024',
    expires: 'Jan 15, 2025',
    revenue: '$1,200 upfront + 5% royalties',
    permissions: 'Digital, print, social media advertising. No AI training.',
    progress: 25
  },
  {
    id: '2',
    title: 'Exclusive Digital Distribution Rights',
    type: 'exclusive',
    licensee: 'Global Media Inc.',
    work: 'Urban Landscapes Collection',
    created: 'Feb 02, 2024',
    expires: 'Feb 02, 2026',
    revenue: '$3,500 + quarterly royalties',
    permissions: 'Digital distribution, display, and revenue sharing. AI training permitted.',
    progress: 15
  },
  {
    id: '3',
    title: 'Limited Usage License',
    type: 'limited',
    licensee: 'Indie Game Studio',
    work: 'Character Design - Hero Series',
    created: 'Mar 10, 2024',
    expires: 'Mar 10, 2025',
    revenue: '$850 flat fee',
    permissions: 'Single game title, no merchandise, no transfer of rights.',
    progress: 10
  },
];
