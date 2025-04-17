import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileCheck,
  Copy,
  Settings,
  Image,
  FileText,
  Music,
  Video,
  DollarSign,
  Calendar,
  Users,
  Brain,
  Globe,
  Smartphone,
  Tv,
  Printer
} from "lucide-react";
import Link from "next/link";

export default function CreateLicensePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <Link href="/dashboard/licensing" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Licensing
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Create New License</h1>
          <p className="text-muted-foreground">
            Define license terms for your creative work to protect your rights and enable monetization.
          </p>
        </div>

        {/* License Creation Form */}
        <Tabs defaultValue="template" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Choose a starting point</CardTitle>
              <CardDescription>
                Start with a template or create a custom license from scratch.
              </CardDescription>
              <TabsList className="grid grid-cols-2 mt-2">
                <TabsTrigger value="template" className="gap-2">
                  <Copy className="h-4 w-4" /> Use Template
                </TabsTrigger>
                <TabsTrigger value="custom" className="gap-2">
                  <Settings className="h-4 w-4" /> Custom License
                </TabsTrigger>
              </TabsList>
            </CardHeader>
          </Card>

          <TabsContent value="template">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>License Templates</CardTitle>
                <CardDescription>
                  Choose from pre-defined license templates optimized for different use cases.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {licenseTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`
                        border rounded-lg p-4 cursor-pointer transition-all hover:border-primary
                        ${template.id === 'commercial' ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800/30' : ''}
                        ${template.id === 'exclusive' ? 'bg-violet-50/50 dark:bg-violet-950/10 border-violet-200 dark:border-violet-800/30' : ''}
                        ${template.id === 'limited' ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/30' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-base">{template.name}</h3>
                        {template.popular && (
                          <Badge className="bg-violet-500">Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 mb-4">
                        {template.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>{template.pricing}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{template.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{template.permissions}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Brain className="h-3.5 w-3.5" />
                          <span>{template.aiTraining}</span>
                        </div>
                      </div>

                      <Button className="w-full mt-4">
                        Use This Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Need a specialized license?
                  <Button variant="link" className="p-0 h-auto text-sm ml-1">
                    Create a custom license
                  </Button>
                </div>
                <Button variant="outline">
                  Import Contract
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Create Custom License</CardTitle>
                <CardDescription>
                  Define all license terms manually for complete customization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="license-title">License Title</Label>
                  <Input id="license-title" placeholder="e.g., Commercial Usage License for Character Design" />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="license-type">License Type</Label>
                    <Select>
                      <SelectTrigger id="license-type">
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="exclusive">Exclusive</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                        <SelectItem value="royalty-free">Royalty-Free</SelectItem>
                        <SelectItem value="personal">Personal Use Only</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="work">Work to License</Label>
                    <Select>
                      <SelectTrigger id="work">
                        <SelectValue placeholder="Select work" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work1">Character Design - Hero Series</SelectItem>
                        <SelectItem value="work2">Urban Landscapes Collection</SelectItem>
                        <SelectItem value="work3">Ambient Music Track - Serenity</SelectItem>
                        <SelectItem value="work4">Product Promotional Video</SelectItem>
                        <SelectItem value="work5">Tech Blog Article Series</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="licensee-name">Licensee Name</Label>
                    <Input id="licensee-name" placeholder="Individual or company name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licensee-email">Licensee Email</Label>
                    <Input id="licensee-email" type="email" placeholder="Contact email" />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Payment Terms</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="upfront-fee" className="text-sm">Upfront Fee</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="upfront-fee" className="pl-8" placeholder="0.00" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="royalty-percentage" className="text-sm">Royalty Percentage</Label>
                      <div className="relative">
                        <Input id="royalty-percentage" placeholder="0" />
                        <span className="absolute right-2.5 top-2.5 text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">License Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose and scope of this license..."
                    rows={4}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Usage Rights</Label>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="digital" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="digital" className="text-sm flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5" /> Digital Use
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="print" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="print" className="text-sm flex items-center gap-2">
                          <Printer className="h-3.5 w-3.5" /> Print Media
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="social" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="social" className="text-sm flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" /> Social Media
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="broadcast" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="broadcast" className="text-sm flex items-center gap-2">
                          <Tv className="h-3.5 w-3.5" /> Broadcast
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="mobile" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="mobile" className="text-sm flex items-center gap-2">
                          <Smartphone className="h-3.5 w-3.5" /> Mobile Apps
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="ai-training" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="ai-training" className="text-sm flex items-center gap-2">
                          <Brain className="h-3.5 w-3.5" /> AI Training
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restrictions">Additional Restrictions</Label>
                  <Textarea
                    id="restrictions"
                    placeholder="Specify any additional limitations or requirements..."
                    rows={3}
                  />
                </div>

                <div className="border rounded-lg p-4 bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800/30">
                  <div className="flex items-center gap-3 mb-2">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Legal Disclaimer</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This license agreement will be legally binding once signed by both parties. We recommend consulting with a legal professional before finalizing any license agreements, particularly for high-value works or complex usage terms.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline">Save as Draft</Button>
                <Button variant="outline">Preview</Button>
                <Button>Create License</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Sample data
interface LicenseTemplate {
  id: string;
  name: string;
  description: string;
  pricing: string;
  duration: string;
  permissions: string;
  aiTraining: string;
  popular?: boolean;
}

const licenseTemplates: LicenseTemplate[] = [
  {
    id: 'commercial',
    name: 'Commercial License',
    description: 'Standard commercial license for businesses using your content in marketing, products, or services.',
    pricing: 'Upfront fee + optional royalties',
    duration: 'Typically 1-2 years with renewal option',
    permissions: 'Digital, print, and specified media use',
    aiTraining: 'Typically not allowed without additional fee',
    popular: true
  },
  {
    id: 'exclusive',
    name: 'Exclusive Rights License',
    description: 'Grants exclusive usage rights to the licensee in specified domains, preventing others from using the work.',
    pricing: 'Premium upfront fee + royalties',
    duration: 'Typically 2-5 years',
    permissions: 'Exclusive rights in defined territories/media',
    aiTraining: 'Negotiable with additional terms',
  },
  {
    id: 'limited',
    name: 'Limited Usage License',
    description: 'Restricted license for specific use cases with clear limitations on scope and distribution.',
    pricing: 'Modest flat fee or one-time payment',
    duration: 'Typically 1 year or less',
    permissions: 'Limited to specific project or platform',
    aiTraining: 'Not permitted',
  },
  {
    id: 'royalty-free',
    name: 'Royalty-Free License',
    description: 'One-time payment for ongoing usage rights without recurring royalty obligations.',
    pricing: 'One-time upfront payment',
    duration: 'Perpetual (no expiration)',
    permissions: 'Broad usage rights with some limitations',
    aiTraining: 'Usually not included, requires separate license',
  },
  {
    id: 'ai-training',
    name: 'AI Training License',
    description: 'Specifically for allowing use of your work to train AI systems with clear attribution requirements.',
    pricing: 'Upfront fee + performance-based royalties',
    duration: 'Typically 1-3 years',
    permissions: 'Limited to AI training only',
    aiTraining: 'Explicitly permitted with requirements',
    popular: true
  },
  {
    id: 'educational',
    name: 'Educational License',
    description: 'For academic and educational institutions to use your work in teaching and research.',
    pricing: 'Reduced fees for educational purposes',
    duration: 'Academic year or custom term',
    permissions: 'Limited to educational contexts',
    aiTraining: 'Permitted for academic research only',
  },
];
