"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Upload, Search, Shield, BrainCircuit, Database, Info, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { detectAITrainingUsage, type AITrainingDetectionResult } from "@/lib/ai-training-detection";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getUserCreativeWorks } from "@/lib/actions/rights-registry";
import type { WorkType } from "@prisma/client";

export default function AITrainingDetectionPage() {
  const [scanType, setScanType] = useState<"url" | "file" | "registered">("file");
  const [scanDepth, setScanDepth] = useState<"normal" | "deep">("normal");
  const [contentType, setContentType] = useState<"IMAGE" | "VIDEO" | "AUDIO" | "TEXT">("IMAGE");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [url, setUrl] = useState("");
  const [registeredWorkId, setRegisteredWorkId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState<AITrainingDetectionResult | null>(null);
  const [registeredWorks, setRegisteredWorks] = useState<{id: string, title: string, type: string}[]>([]);
  const [isLoadingWorks, setIsLoadingWorks] = useState(false);

  // Load registered works
  const loadRegisteredWorks = async () => {
    setIsLoadingWorks(true);
    try {
      const response = await getUserCreativeWorks();
      if (response.success && response.works) {
        setRegisteredWorks(response.works.map(work => ({
          id: work.id,
          title: work.title,
          type: work.type
        })));
      } else {
        toast.error("Failed to load your registered works");
      }
    } catch (error) {
      console.error("Error fetching works:", error);
      toast.error("Failed to load your registered works");
    } finally {
      setIsLoadingWorks(false);
    }
  };

  // Load works when switching to registered works tab
  const handleScanTypeChange = (value: string) => {
    setScanType(value as "url" | "file" | "registered");
    if (value === "registered" && registeredWorks.length === 0) {
      loadRegisteredWorks();
    }
  };

  // File upload handler
  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);

    // Auto-detect content type from file
    if (files.length > 0) {
      const file = files[0];
      const mimeType = file.type;

      if (mimeType.startsWith('image/')) {
        setContentType('IMAGE');
      } else if (mimeType.startsWith('video/')) {
        setContentType('VIDEO');
      } else if (mimeType.startsWith('audio/')) {
        setContentType('AUDIO');
      } else {
        setContentType('TEXT');
      }
    }
  };

  // Simulate progress updates
  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 200);

    return interval;
  };

  // Start scan
  const handleStartScan = async () => {
    // Validate input
    if (scanType === "file" && uploadedFiles.length === 0) {
      toast.error("Please upload a file to scan");
      return;
    }

    if (scanType === "url" && !url) {
      toast.error("Please enter a URL to scan");
      return;
    }

    if (scanType === "registered" && !registeredWorkId) {
      toast.error("Please select a registered work to scan");
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    // Start progress simulation
    const progressInterval = simulateProgress();

    try {
      let content: any;
      let type = contentType;

      // Prepare content based on scan type
      if (scanType === "file") {
        content = uploadedFiles[0];
      } else if (scanType === "url") {
        // For demo, we'll just use the URL as a string
        content = url;
      } else if (scanType === "registered") {
        // Find the selected work
        const selectedWork = registeredWorks.find(work => work.id === registeredWorkId);
        if (selectedWork) {
          content = selectedWork.title; // In a real app, we'd fetch the actual content
          type = selectedWork.type as WorkType;
        } else {
          throw new Error("Selected work not found");
        }
      }

      // Run detection
      const result = await detectAITrainingUsage(
        content,
        type,
        registeredWorkId,
        {
          deepScan: scanDepth === "deep",
          sensitivityLevel: scanDepth === "deep" ? "high" : "medium"
        }
      );

      // Complete progress
      setProgress(100);
      setScanResult(result);

      if (result.detected) {
        toast.warning("Potential AI training usage detected", {
          description: `Confidence: ${Math.round(result.confidence * 100)}%`
        });
      } else {
        toast.success("No AI training usage detected", {
          description: "Your content appears to be safe from unauthorized AI training"
        });
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Error during scanning", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      clearInterval(progressInterval);
      setIsScanning(false);
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
              Back to Detection
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">AI Training Detection</h1>
            <p className="text-muted-foreground">
              Analyze content to detect if it has been used in AI model training
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Scan Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Configuration</CardTitle>
              <CardDescription>
                Configure the AI training usage detection scan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scan Type Tabs */}
              <div className="space-y-2">
                <Label>What do you want to scan?</Label>
                <Tabs value={scanType} onValueChange={handleScanTypeChange} className="w-full">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="file" className="flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload</span>
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-1">
                      <Search className="h-3.5 w-3.5" />
                      <span>URL</span>
                    </TabsTrigger>
                    <TabsTrigger value="registered" className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Registered</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="file" className="pt-4">
                    <FileUpload
                      accept="*/*"
                      maxSize={20}
                      maxFiles={1}
                      onChange={handleFileUpload}
                      uploadIcon={<Upload className="h-8 w-8 text-muted-foreground mb-2" />}
                      uploadText={
                        <>
                          <p className="font-medium">Click to upload or drag and drop</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Image, video, audio, or text file (max 20MB)
                          </p>
                        </>
                      }
                    />
                  </TabsContent>

                  <TabsContent value="url" className="pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="url">Content URL</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com/content"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the URL of the content you want to analyze
                      </p>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label>Content Type</Label>
                      <RadioGroup
                        value={contentType}
                        onValueChange={(value) => setContentType(value as any)}
                        className="grid grid-cols-2 gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="IMAGE" id="image-type" />
                          <Label htmlFor="image-type">Image</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="VIDEO" id="video-type" />
                          <Label htmlFor="video-type">Video</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="AUDIO" id="audio-type" />
                          <Label htmlFor="audio-type">Audio</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="TEXT" id="text-type" />
                          <Label htmlFor="text-type">Text</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </TabsContent>

                  <TabsContent value="registered" className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="registered-work">Registered Work</Label>
                        {isLoadingWorks && (
                          <Badge variant="outline" className="font-normal">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Loading...
                          </Badge>
                        )}
                      </div>
                      <div className="max-h-[240px] overflow-y-auto border rounded-md divide-y">
                        {registeredWorks.length === 0 ? (
                          <div className="px-4 py-6 text-center text-muted-foreground">
                            {isLoadingWorks ? (
                              <div className="flex flex-col items-center">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                <p>Loading your registered works...</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Database className="h-8 w-8 mb-2 text-muted-foreground" />
                                <p>No registered works found</p>
                                <Button
                                  variant="link"
                                  size="sm"
                                  asChild
                                  className="mt-2"
                                >
                                  <Link href="/dashboard/rights-registry/register">
                                    Register a new work
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          registeredWorks.map((work) => (
                            <div
                              key={work.id}
                              className={`flex items-center p-3 hover:bg-accent/50 cursor-pointer ${
                                registeredWorkId === work.id ? "bg-accent" : ""
                              }`}
                              onClick={() => setRegisteredWorkId(work.id)}
                            >
                              <div className="mr-2">
                                {registeredWorkId === work.id ? (
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border border-muted" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{work.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <Badge variant="outline" className="text-xs">
                                    {work.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Scan Depth */}
              <div className="space-y-2 border-t pt-4">
                <Label>Scan Depth</Label>
                <RadioGroup
                  value={scanDepth}
                  onValueChange={(value) => setScanDepth(value as "normal" | "deep")}
                  className="grid gap-2"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="normal" id="normal-scan" className="mt-1" />
                    <div>
                      <Label htmlFor="normal-scan" className="font-medium">Normal Scan</Label>
                      <p className="text-sm text-muted-foreground">
                        Standard pattern matching to detect common AI training signatures
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="deep" id="deep-scan" className="mt-1" />
                    <div>
                      <Label htmlFor="deep-scan" className="font-medium">Deep Scan</Label>
                      <p className="text-sm text-muted-foreground">
                        Intensive analysis to detect subtle patterns and partial content usage
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <Button
                className="w-full"
                onClick={handleStartScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Start Detection Scan
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Results Card */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Results</CardTitle>
              <CardDescription>
                Analysis of potential AI training usage
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              {isScanning ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 py-8">
                  <BrainCircuit className="h-12 w-12 text-primary/20 animate-pulse" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-1">Analyzing Content</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Scanning for AI training signatures...
                    </p>
                  </div>
                  <div className="w-full max-w-md space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Analyzing patterns</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                </div>
              ) : scanResult ? (
                <div className="space-y-6">
                  {/* Result Summary */}
                  <div className="flex items-center justify-center py-6">
                    <div className={`flex flex-col items-center ${
                      scanResult.detected
                        ? "text-amber-500 dark:text-amber-400"
                        : "text-green-500 dark:text-green-400"
                    }`}>
                      {scanResult.detected ? (
                        <>
                          <AlertCircle className="h-16 w-16 mb-2" />
                          <h3 className="text-xl font-medium">
                            Potential AI Training Detected
                          </h3>
                          <p className="text-sm">
                            Confidence: {Math.round(scanResult.confidence * 100)}%
                          </p>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-16 w-16 mb-2" />
                          <h3 className="text-xl font-medium">
                            No AI Training Detected
                          </h3>
                          <p className="text-sm">
                            Your content appears to be safe
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Detection Details */}
                  <Accordion type="single" collapsible className="w-full">
                    {/* Models */}
                    <AccordionItem value="models">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <span className="font-medium">Detected Models</span>
                          {scanResult.models.length > 0 && (
                            <Badge className="ml-2" variant="outline">
                              {scanResult.models.length}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {scanResult.models.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">
                            No specific AI models detected
                          </p>
                        ) : (
                          <div className="space-y-3 py-2">
                            {scanResult.models.map((model, index) => (
                              <div key={index} className="border rounded-md p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium">{model.modelName}</div>
                                  <Badge variant={
                                    model.evidenceStrength === "strong" ? "default" :
                                    model.evidenceStrength === "moderate" ? "secondary" : "outline"
                                  }>
                                    {model.evidenceStrength} evidence
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <div className="flex justify-between items-center">
                                    <span>Provider:</span>
                                    <span>{model.provider}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Confidence:</span>
                                    <span>{Math.round(model.confidence * 100)}%</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Last Updated:</span>
                                    <span>{model.lastUpdated}</span>
                                  </div>
                                  {model.trainingPeriod && (
                                    <div className="flex justify-between items-center">
                                      <span>Training Period:</span>
                                      <span>{model.trainingPeriod.start} to {model.trainingPeriod.end}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Analysis Details */}
                    <AccordionItem value="details">
                      <AccordionTrigger>
                        <span className="font-medium">Analysis Details</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 py-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Evidence Type:</div>
                            <div>{scanResult.evidenceType}</div>

                            <div className="text-muted-foreground">Unique Pattern Found:</div>
                            <div>{scanResult.uniquePatternFound ? "Yes" : "No"}</div>

                            <div className="text-muted-foreground">Pattern Matches:</div>
                            <div>{scanResult.details.matchedPatterns} of {scanResult.details.totalCheckedPatterns}</div>

                            <div className="text-muted-foreground">Output Similarity:</div>
                            <div>{Math.round(scanResult.details.outputSimilarity * 100)}%</div>

                            {scanResult.details.reconstructionQuality !== undefined && (
                              <>
                                <div className="text-muted-foreground">Reconstruction Quality:</div>
                                <div>{Math.round(scanResult.details.reconstructionQuality * 100)}%</div>
                              </>
                            )}

                            {scanResult.details.semanticPreservation !== undefined && (
                              <>
                                <div className="text-muted-foreground">Semantic Preservation:</div>
                                <div>{Math.round(scanResult.details.semanticPreservation * 100)}%</div>
                              </>
                            )}

                            {scanResult.details.stylePersistence !== undefined && (
                              <>
                                <div className="text-muted-foreground">Style Persistence:</div>
                                <div>{Math.round(scanResult.details.stylePersistence * 100)}%</div>
                              </>
                            )}
                          </div>

                          {/* Recognizable Elements */}
                          {scanResult.details.recognizableElements.length > 0 && (
                            <div className="pt-2">
                              <div className="text-sm text-muted-foreground mb-1.5">Recognizable Elements:</div>
                              <div className="flex flex-wrap gap-1.5">
                                {scanResult.details.recognizableElements.map((element, index) => (
                                  <Badge key={index} variant="outline">
                                    {element}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Frequency Response (for audio) */}
                          {scanResult.details.frequencyResponse && (
                            <div className="pt-2">
                              <div className="text-sm text-muted-foreground mb-1.5">Frequency Response:</div>
                              <div className="h-20 flex items-end space-x-1">
                                {scanResult.details.frequencyResponse.map((value, index) => (
                                  <div
                                    key={index}
                                    className="w-full bg-primary"
                                    style={{ height: `${value * 100}%` }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="bg-muted/30 p-6 rounded-full mb-4">
                    <BrainCircuit className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No Scan Results Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Upload a file, enter a URL, or select a registered work and run a
                    detection scan to analyze potential AI training usage.
                  </p>
                </div>
              )}
            </CardContent>

            {scanResult && (
              <CardFooter className="border-t bg-muted/50 flex justify-between px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Analysis completed on {new Date(scanResult.analysisTimestamp).toLocaleString()}
                </div>
                {scanResult.details.reportUrl && (
                  <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                    <a href={scanResult.details.reportUrl} target="_blank" rel="noopener noreferrer">
                      View Full Report
                    </a>
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Informational Card */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <Info className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-base font-medium mb-1">About AI Training Detection</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This tool analyzes content to identify patterns indicating it may have been used
                  in AI model training. Detection is based on pattern recognition, behavioral analysis,
                  and model output comparison.
                </p>
                <div className="text-sm">
                  <span className="font-medium">Detection methods include:</span>
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-muted-foreground">
                    <li>Pattern recognition to identify unique content signatures</li>
                    <li>Behavioral analysis comparing model outputs with original works</li>
                    <li>Stylistic analysis examining reproduction of key characteristics</li>
                    <li>Frequency and semantic analysis for audio and text content</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
