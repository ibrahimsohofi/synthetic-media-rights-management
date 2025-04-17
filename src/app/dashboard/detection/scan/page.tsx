"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertCircle, Info, Check, Shield, Globe, Sparkles, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// In a real app, these functions would be imported from your actions/detection module
async function startScan(scanOptions) {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        scanId: "scan-" + Math.random().toString(36).substring(2, 10),
        message: "Scan started successfully"
      });
    }, 1500);
  });
}

async function getUserCreativeWorks() {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        works: [
          { id: "work1", title: "Neon Cityscape Series", type: "IMAGE" },
          { id: "work2", title: "Abstract Motion Series", type: "VIDEO" },
          { id: "work3", title: "Ambient Soundscape Collection", type: "AUDIO" },
          { id: "work4", title: "Digital Portrait Series", type: "IMAGE" },
          { id: "work5", title: "Techno Beats EP", type: "AUDIO" }
        ]
      });
    }, 500);
  });
}

export default function DetectionScanPage() {
  const [scanType, setScanType] = useState<"quick" | "comprehensive" | "targeted">("quick");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanStarted, setScanStarted] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [platforms, setPlatforms] = useState({
    socialMedia: true,
    news: true,
    ecommerce: true,
    aiModels: true,
    portfolioSites: true,
    stockPhotos: true,
  });
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [targetUrl, setTargetUrl] = useState("");
  const [works, setWorks] = useState<any[]>([]);
  const [scanDepth, setScanDepth] = useState<"standard" | "deep">("standard");

  // Fetch creative works on component mount
  useState(() => {
    const fetchWorks = async () => {
      const result = await getUserCreativeWorks();
      if (result.success) {
        setWorks(result.works);
      }
    };

    fetchWorks();
  });

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setPlatforms({
      ...platforms,
      [platform]: checked
    });
  };

  const handleWorkSelection = (workId: string, checked: boolean) => {
    if (checked) {
      setSelectedWorks([...selectedWorks, workId]);
    } else {
      setSelectedWorks(selectedWorks.filter(id => id !== workId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form based on scan type
    if (scanType === "targeted" && !targetUrl) {
      setError("Please enter a target URL for the scan");
      return;
    }

    if ((scanType === "comprehensive" || scanType === "targeted") && selectedWorks.length === 0) {
      setError("Please select at least one work to scan");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare scan options based on form inputs
      const scanOptions = {
        scanType,
        platforms: Object.entries(platforms)
          .filter(([_, enabled]) => enabled)
          .map(([name]) => name),
        works: selectedWorks,
        targetUrl: scanType === "targeted" ? targetUrl : undefined,
        scanDepth
      };

      // Start the scan
      const result = await startScan(scanOptions);

      if (result.success) {
        setShowSuccess(true);
        toast.success("Scan started successfully");

        // Simulate scan progress
        setScanStarted(true);
        const interval = setInterval(() => {
          setScanProgress(prev => {
            const newProgress = prev + (scanType === "quick" ? 10 : 5);
            if (newProgress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                toast.success("Scan completed! Found 3 potential matches.");
                router.push("/dashboard/detection");
              }, 1500);
              return 100;
            }
            return newProgress;
          });
        }, 1000);
      } else {
        setError(result.message || "Failed to start scan");
        toast.error(result.message || "Failed to start scan");
      }
    } catch (error) {
      console.error("Scan error:", error);
      setError("An error occurred while starting the scan. Please try again.");
      toast.error("Failed to start scan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <Link
              href="/dashboard/detection"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-1"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Detection Center
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Run Detection Scan</h1>
            <p className="text-muted-foreground">
              Scan the web for unauthorized use of your registered creative works
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Configure Scan</CardTitle>
              <CardDescription>
                Choose the type of scan and platforms to search for your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="flex items-start space-x-3 p-3 border border-red-200 rounded-md bg-red-50 dark:border-red-900/30 dark:bg-red-900/10">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                </div>
              )}

              {showSuccess && (
                <div className="flex items-start space-x-3 p-3 border border-green-200 rounded-md bg-green-50 dark:border-green-900/30 dark:bg-green-900/10">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    <p className="font-medium">Scan started successfully!</p>
                    <p>You'll receive notifications when potential matches are found.</p>
                  </div>
                </div>
              )}

              {scanStarted && (
                <div className="space-y-3">
                  <h3 className="text-base font-medium">Scan in Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <Progress value={scanProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {scanProgress < 100 ? "Scanning..." : "Analyzing results..."}
                    </p>
                  </div>
                </div>
              )}

              {!scanStarted && (
                <>
                  {/* Scan Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Scan Type</Label>
                    <RadioGroup
                      value={scanType}
                      onValueChange={(value) => setScanType(value as any)}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="flex flex-col space-y-3 border rounded-md p-4">
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="quick" id="quick" />
                          <div>
                            <Label htmlFor="quick" className="font-medium cursor-pointer">Quick Scan</Label>
                            <p className="text-sm text-muted-foreground">
                              Fast scan of major platforms covering all your registered works
                            </p>
                            <div className="text-xs text-muted-foreground mt-1">~10 minutes</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3 border rounded-md p-4">
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="comprehensive" id="comprehensive" />
                          <div>
                            <Label htmlFor="comprehensive" className="font-medium cursor-pointer">Comprehensive Scan</Label>
                            <p className="text-sm text-muted-foreground">
                              Deep scan of selected works across multiple platforms
                            </p>
                            <div className="text-xs text-muted-foreground mt-1">~1-2 hours</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3 border rounded-md p-4">
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="targeted" id="targeted" />
                          <div>
                            <Label htmlFor="targeted" className="font-medium cursor-pointer">Targeted Scan</Label>
                            <p className="text-sm text-muted-foreground">
                              Scan a specific website or domain for your content
                            </p>
                            <div className="text-xs text-muted-foreground mt-1">~15-30 minutes</div>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Platforms */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Platforms to Scan</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="social-media"
                          checked={platforms.socialMedia}
                          onCheckedChange={(checked) => handlePlatformChange("socialMedia", checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="social-media" className="cursor-pointer">Social Media</Label>
                          <p className="text-xs text-muted-foreground">
                            Instagram, TikTok, Pinterest, Twitter
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="news"
                          checked={platforms.news}
                          onCheckedChange={(checked) => handlePlatformChange("news", checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="news" className="cursor-pointer">News & Media</Label>
                          <p className="text-xs text-muted-foreground">
                            News sites, blogs, media outlets
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="ecommerce"
                          checked={platforms.ecommerce}
                          onCheckedChange={(checked) => handlePlatformChange("ecommerce", checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="ecommerce" className="cursor-pointer">E-commerce</Label>
                          <p className="text-xs text-muted-foreground">
                            Online marketplaces, merchandise
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="ai-models"
                          checked={platforms.aiModels}
                          onCheckedChange={(checked) => handlePlatformChange("aiModels", checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="ai-models" className="cursor-pointer">AI Models</Label>
                          <p className="text-xs text-muted-foreground">
                            AI art generators, content models
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="portfolio-sites"
                          checked={platforms.portfolioSites}
                          onCheckedChange={(checked) => handlePlatformChange("portfolioSites", checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="portfolio-sites" className="cursor-pointer">Portfolio Sites</Label>
                          <p className="text-xs text-muted-foreground">
                            Behance, Dribbble, personal sites
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="stock-photos"
                          checked={platforms.stockPhotos}
                          onCheckedChange={(checked) => handlePlatformChange("stockPhotos", checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="stock-photos" className="cursor-pointer">Stock Photos/Videos</Label>
                          <p className="text-xs text-muted-foreground">
                            Stock media marketplaces
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Targeted URL if targeted scan */}
                  {scanType === "targeted" && (
                    <div className="space-y-3">
                      <Label htmlFor="target-url">Target URL <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="target-url"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="pl-9"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter a specific website, platform, or domain to scan for your content
                      </p>
                    </div>
                  )}

                  {/* Work Selection for comprehensive and targeted scans */}
                  {(scanType === "comprehensive" || scanType === "targeted") && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Select Works to Scan</Label>
                      <div className="space-y-3 border rounded-md p-4 max-h-60 overflow-y-auto">
                        {works.map((work) => (
                          <div key={work.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`work-${work.id}`}
                              checked={selectedWorks.includes(work.id)}
                              onCheckedChange={(checked) => handleWorkSelection(work.id, checked as boolean)}
                            />
                            <div className="grid gap-1 leading-none">
                              <Label htmlFor={`work-${work.id}`} className="cursor-pointer">{work.title}</Label>
                              <div className="text-xs text-muted-foreground">{work.type}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scan Depth */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Scan Depth</Label>
                    <RadioGroup
                      value={scanDepth}
                      onValueChange={(value) => setScanDepth(value as any)}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="standard" id="standard-depth" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="standard-depth" className="font-medium cursor-pointer">Standard</Label>
                          <p className="text-sm text-muted-foreground">
                            Good detection with optimized performance
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="deep" id="deep-depth" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="deep-depth" className="font-medium cursor-pointer">Deep Scan</Label>
                          <p className="text-sm text-muted-foreground">
                            Enhanced detection for modified or transformed content (takes longer)
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border border-blue-200 rounded-md bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center mt-0.5">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      <p>Detection scans use AI-powered matching technology to identify potential matches for your registered works. Results will be sorted by confidence level and require your review.</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              {!scanStarted ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Starting Scan..." : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Start {scanType} Scan
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => window.location.href = "/dashboard/detection"}
                >
                  <Search className="mr-2 h-4 w-4" /> View Results
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
