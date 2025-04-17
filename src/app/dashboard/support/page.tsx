import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BookOpen, FileText, Globe, HelpCircle, Mail, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help & Support | SyntheticRights",
  description: "Get help with your synthetic media rights management",
};

export default function SupportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground">
            Get assistance with your synthetic media rights management
          </p>
        </div>

        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="docs">
              <FileText className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="contact">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Us
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Quick answers to common questions about using SyntheticRights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <h3 className="font-semibold">How does rights registration work?</h3>
                  <p className="text-sm text-muted-foreground">
                    When you register your synthetic media, we create a cryptographic fingerprint and securely store it on our blockchain. This establishes proof of creation and ownership that can be verified independently.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">What types of media can I register?</h3>
                  <p className="text-sm text-muted-foreground">
                    SyntheticRights supports various media types including images, videos, audio files, and text. Each media type has specific requirements for optimal fingerprinting and detection.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">How does media detection work?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our detection system uses AI-powered image and style recognition to identify potential matches across the internet. The system can detect both exact copies and derivative works that incorporate your media.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">What should I do if my rights are violated?</h3>
                  <p className="text-sm text-muted-foreground">
                    If our system detects unauthorized use of your media, you'll receive a notification with details. You can then choose to ignore it, send a licensing offer, or issue a takedown request through our platform.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">How do I create a license for my work?</h3>
                  <p className="text-sm text-muted-foreground">
                    Navigate to the Licensing section, click "Create License," and follow the guided process to set permissions, restrictions, duration, and pricing. You can create different license types for various use cases.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="px-0">
                  <Link href="#" className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    View all FAQs
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Comprehensive guides and resources to help you use SyntheticRights effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link href="#" className="block">
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <BookOpen className="h-5 w-5 text-violet-500 mb-2" />
                        <CardTitle className="text-base">Getting Started Guide</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          Learn the basics of registering your synthetic media and managing rights
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="#" className="block">
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <Globe className="h-5 w-5 text-violet-500 mb-2" />
                        <CardTitle className="text-base">Licensing Best Practices</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          Strategies for effectively licensing your synthetic media
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="#" className="block">
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <AlertCircle className="h-5 w-5 text-violet-500 mb-2" />
                        <CardTitle className="text-base">Violation Handling</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          Step-by-step process for addressing rights violations
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="#" className="block">
                    <Card className="h-full hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <FileText className="h-5 w-5 text-violet-500 mb-2" />
                        <CardTitle className="text-base">API Documentation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          Technical reference for integrating with our services
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="px-0">
                  <Link href="#" className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse full documentation
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Have a specific question? Our support team is here to help.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your.email@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Brief description of your issue" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your issue in detail"
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button className="w-full">Submit Support Request</Button>
                </form>
              </CardContent>
            </Card>

            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertTitle>Need immediate assistance?</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>Our support team is available through these additional channels:</p>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">+1 (800) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm">support@syntheticrights.com</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
