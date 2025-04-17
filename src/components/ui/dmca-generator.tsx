"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Download, CheckCheck, HelpCircle, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DmcaGeneratorProps {
  workId?: string;
  workTitle?: string;
  workType?: string;
  registeredDate?: Date;
  metadataHash?: string;
  certificateId?: string;
  userInfo?: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
  defaultInfringingUrl?: string;
}

export function DmcaGenerator({
  workId,
  workTitle = "",
  workType = "",
  registeredDate,
  metadataHash,
  certificateId,
  userInfo,
  defaultInfringingUrl = ""
}: DmcaGeneratorProps) {
  // Form state
  const [formData, setFormData] = useState({
    senderName: userInfo?.name || "",
    senderEmail: userInfo?.email || "",
    senderAddress: userInfo?.address || "",
    senderPhone: userInfo?.phone || "",
    originalContent: {
      title: workTitle,
      url: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/rights-registry/${workId}` : "",
      description: `${workType} content registered with SyntheticRights.com`,
      registrationDate: registeredDate ? new Date(registeredDate).toLocaleDateString() : new Date().toLocaleDateString(),
    },
    infringingContent: {
      url: defaultInfringingUrl,
      platformName: "",
      description: "",
    },
    recipientName: "",
    recipientEmail: "",
    recipientWebsite: "",
    includeCertificateInfo: true,
    includeGoodFaithStatement: true,
    includeAccuracyStatement: true,
    includePenaltyStatement: true,
  });

  const [generatedNotice, setGeneratedNotice] = useState("");
  const [activeTab, setActiveTab] = useState("form");
  const [copied, setCopied] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split(".");

    if (field) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle checkbox changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Generate DMCA notice
  const handleGenerateNotice = () => {
    // Validation
    if (!formData.senderName || !formData.senderEmail) {
      toast.error("Please provide your name and email address");
      return;
    }

    if (!formData.originalContent.title || !formData.originalContent.url) {
      toast.error("Please provide information about your original content");
      return;
    }

    if (!formData.infringingContent.url) {
      toast.error("Please provide the URL of the infringing content");
      return;
    }

    // Create verification link if certificate info is available
    const verificationLink = metadataHash
      ? `${window.location.origin}/verify/${metadataHash}`
      : "";

    // Generate the takedown notice
    const date = new Date().toLocaleDateString();

    let notice = `DMCA TAKEDOWN NOTICE\n\nDate: ${date}\n\n`;

    // Recipient info
    if (formData.recipientName || formData.recipientEmail || formData.recipientWebsite) {
      notice += "TO:\n";
      if (formData.recipientName) notice += `${formData.recipientName}\n`;
      if (formData.recipientWebsite) notice += `${formData.recipientWebsite}\n`;
      if (formData.recipientEmail) notice += `${formData.recipientEmail}\n`;
      notice += "\n";
    }

    // Intro
    notice += `My name is ${formData.senderName} and I am the copyright owner of ${formData.originalContent.title}. I have a good faith belief that the use of my material in the manner complained of is not authorized by me, the copyright owner, or the law.\n\n`;

    // Original content details
    notice += "ORIGINAL COPYRIGHTED WORK:\n";
    notice += `Title: ${formData.originalContent.title}\n`;
    notice += `Type: ${workType || "Creative work"}\n`;
    notice += `URL: ${formData.originalContent.url}\n`;
    if (formData.originalContent.description) {
      notice += `Description: ${formData.originalContent.description}\n`;
    }
    if (formData.originalContent.registrationDate) {
      notice += `Registration Date: ${formData.originalContent.registrationDate}\n`;
    }

    // Certificate info if available and selected
    if (formData.includeCertificateInfo && certificateId) {
      notice += "\nVERIFICATION INFORMATION:\n";
      notice += `Certificate ID: ${certificateId}\n`;
      if (metadataHash) {
        notice += `Blockchain Verification: Available\n`;
        notice += `Verification URL: ${verificationLink}\n`;
      }
    }

    // Infringing content details
    notice += "\nINFRINGING MATERIAL:\n";
    notice += `URL: ${formData.infringingContent.url}\n`;
    if (formData.infringingContent.platformName) {
      notice += `Platform: ${formData.infringingContent.platformName}\n`;
    }
    if (formData.infringingContent.description) {
      notice += `Additional Details: ${formData.infringingContent.description}\n`;
    }

    // Required statements
    notice += "\nSTATEMENTS:\n";

    if (formData.includeGoodFaithStatement) {
      notice += "I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.\n\n";
    }

    if (formData.includeAccuracyStatement) {
      notice += "The information in this notification is accurate, and under penalty of perjury, I am the owner, or an agent authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed.\n\n";
    }

    if (formData.includePenaltyStatement) {
      notice += "I understand that abuse of this tool or process may result in termination of my SyntheticRights account or legal consequences.\n\n";
    }

    // Contact details
    notice += "CONTACT INFORMATION:\n";
    notice += `Name: ${formData.senderName}\n`;
    notice += `Email: ${formData.senderEmail}\n`;
    if (formData.senderAddress) notice += `Address: ${formData.senderAddress}\n`;
    if (formData.senderPhone) notice += `Phone: ${formData.senderPhone}\n`;

    // Signature
    notice += `\nSincerely,\n\n${formData.senderName}\n`;

    // Update state with generated notice
    setGeneratedNotice(notice);
    setActiveTab("preview");

    toast.success("DMCA takedown notice generated successfully");
  };

  // Copy notice to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedNotice);
    setCopied(true);
    toast.success("DMCA notice copied to clipboard");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Download as text file
  const handleDownload = () => {
    const blob = new Blob([generatedNotice], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dmca-takedown-notice.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("DMCA notice downloaded as text file");
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          DMCA Takedown Notice Generator
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">Help</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm">
                <p>Generate a properly formatted DMCA takedown notice to send to websites or platforms hosting your content without permission.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Create a DMCA takedown notice to protect your content from unauthorized use
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="form">Notice Form</TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedNotice}>Preview Notice</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-0">
            <div className="space-y-4">
              <Alert variant="warning" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle>Important Information</AlertTitle>
                <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
                  Use this tool to create DMCA takedown notices only for content you own. Misuse of DMCA notices can have legal consequences.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-base font-medium">Your Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Your Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="senderName"
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">Your Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="senderEmail"
                      name="senderEmail"
                      type="email"
                      value={formData.senderEmail}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderAddress">Your Address (Optional)</Label>
                    <Input
                      id="senderAddress"
                      name="senderAddress"
                      value={formData.senderAddress}
                      onChange={handleInputChange}
                      placeholder="Your physical address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderPhone">Your Phone (Optional)</Label>
                    <Input
                      id="senderPhone"
                      name="senderPhone"
                      value={formData.senderPhone}
                      onChange={handleInputChange}
                      placeholder="Your contact number"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium">Original Content Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="originalContent.title">Original Content Title <span className="text-red-500">*</span></Label>
                    <Input
                      id="originalContent.title"
                      name="originalContent.title"
                      value={formData.originalContent.title}
                      onChange={handleInputChange}
                      placeholder="Title of your original work"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalContent.url">Original Content URL <span className="text-red-500">*</span></Label>
                    <Input
                      id="originalContent.url"
                      name="originalContent.url"
                      value={formData.originalContent.url}
                      onChange={handleInputChange}
                      placeholder="URL where your content is published"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="originalContent.description">Description</Label>
                    <Textarea
                      id="originalContent.description"
                      name="originalContent.description"
                      value={formData.originalContent.description}
                      onChange={handleInputChange}
                      placeholder="Describe your original content"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium">Infringing Content Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="infringingContent.url">Infringing URL <span className="text-red-500">*</span></Label>
                    <Input
                      id="infringingContent.url"
                      name="infringingContent.url"
                      value={formData.infringingContent.url}
                      onChange={handleInputChange}
                      placeholder="URL of the infringing content"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="infringingContent.platformName">Platform/Website Name</Label>
                    <Input
                      id="infringingContent.platformName"
                      name="infringingContent.platformName"
                      value={formData.infringingContent.platformName}
                      onChange={handleInputChange}
                      placeholder="e.g., Facebook, Twitter, etc."
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="infringingContent.description">Additional Details</Label>
                    <Textarea
                      id="infringingContent.description"
                      name="infringingContent.description"
                      value={formData.infringingContent.description}
                      onChange={handleInputChange}
                      placeholder="Describe how your content is being infringed"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium">Recipient Information (Optional)</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      placeholder="e.g., DMCA Agent, Legal Department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Recipient Email</Label>
                    <Input
                      id="recipientEmail"
                      name="recipientEmail"
                      type="email"
                      value={formData.recipientEmail}
                      onChange={handleInputChange}
                      placeholder="e.g., dmca@example.com"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="recipientWebsite">Recipient Website</Label>
                    <Input
                      id="recipientWebsite"
                      name="recipientWebsite"
                      value={formData.recipientWebsite}
                      onChange={handleInputChange}
                      placeholder="e.g., example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium">Additional Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="includeCertificateInfo">Include Certificate Information</Label>
                      <p className="text-xs text-muted-foreground">
                        Add verification information from your registered certificate
                      </p>
                    </div>
                    <Switch
                      id="includeCertificateInfo"
                      checked={formData.includeCertificateInfo}
                      onCheckedChange={(checked) => handleSwitchChange('includeCertificateInfo', checked)}
                      disabled={!certificateId}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="includeGoodFaithStatement">Include Good Faith Statement</Label>
                      <p className="text-xs text-muted-foreground">
                        Statement of good faith belief regarding unauthorized use
                      </p>
                    </div>
                    <Switch
                      id="includeGoodFaithStatement"
                      checked={formData.includeGoodFaithStatement}
                      onCheckedChange={(checked) => handleSwitchChange('includeGoodFaithStatement', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="includeAccuracyStatement">Include Accuracy Statement</Label>
                      <p className="text-xs text-muted-foreground">
                        Statement of accuracy under penalty of perjury
                      </p>
                    </div>
                    <Switch
                      id="includeAccuracyStatement"
                      checked={formData.includeAccuracyStatement}
                      onCheckedChange={(checked) => handleSwitchChange('includeAccuracyStatement', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="includePenaltyStatement">Include Penalty Statement</Label>
                      <p className="text-xs text-muted-foreground">
                        Statement acknowledging penalties for misuse
                      </p>
                    </div>
                    <Switch
                      id="includePenaltyStatement"
                      checked={formData.includePenaltyStatement}
                      onCheckedChange={(checked) => handleSwitchChange('includePenaltyStatement', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            {generatedNotice ? (
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-muted/30 whitespace-pre-wrap font-mono text-sm max-h-[500px] overflow-y-auto">
                  {generatedNotice}
                </div>

                <Alert>
                  <AlertTitle>Next Steps</AlertTitle>
                  <AlertDescription>
                    Copy this notice and send it to the platform or website hosting your content without permission. Many platforms have dedicated DMCA forms or contact emails for copyright complaints.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  Complete the form and generate a notice to see a preview
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between gap-2 pt-6 border-t">
        {activeTab === "form" ? (
          <>
            <Button variant="outline" onClick={() => setFormData({
              senderName: userInfo?.name || "",
              senderEmail: userInfo?.email || "",
              senderAddress: userInfo?.address || "",
              senderPhone: userInfo?.phone || "",
              originalContent: {
                title: workTitle,
                url: typeof window !== 'undefined' ? `${window.location.origin}/dashboard/rights-registry/${workId}` : "",
                description: `${workType} content registered with SyntheticRights.com`,
                registrationDate: registeredDate ? new Date(registeredDate).toLocaleDateString() : new Date().toLocaleDateString(),
              },
              infringingContent: {
                url: defaultInfringingUrl,
                platformName: "",
                description: "",
              },
              recipientName: "",
              recipientEmail: "",
              recipientWebsite: "",
              includeCertificateInfo: true,
              includeGoodFaithStatement: true,
              includeAccuracyStatement: true,
              includePenaltyStatement: true,
            })}>
              Reset Form
            </Button>
            <Button onClick={handleGenerateNotice}>
              Generate Takedown Notice
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setActiveTab("form")}>
              Edit Form
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyToClipboard} className="gap-2">
                {copied ? (
                  <>
                    <CheckCheck className="h-4 w-4" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </Button>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                <span>Download as Text</span>
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
