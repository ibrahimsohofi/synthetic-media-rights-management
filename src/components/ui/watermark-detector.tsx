"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { detectWatermark } from "@/lib/watermarking-utils";
import { Check, FileCheck, FileX, Eye, Fingerprint, Loader2, Shield, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

interface WatermarkDetectorProps {
  onDetectionComplete?: (result: {
    hasWatermark: boolean;
    isVisible: boolean;
    confidence: number;
    extractedData?: Record<string, unknown>;
  }) => void;
}

export function WatermarkDetector({ onDetectionComplete }: WatermarkDetectorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detection, setDetection] = useState<{
    hasWatermark: boolean;
    isVisible: boolean;
    confidence: number;
    extractedData?: Record<string, unknown>;
    error?: string;
  } | null>(null);
  const [advancedOptions, setAdvancedOptions] = useState({
    enhancedDetection: true,
    detectInvisible: true,
    confidenceThreshold: 50
  });
  const [activeTab, setActiveTab] = useState<"upload" | "results">("upload");

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Create a preview URL for image files
    if (selectedFile.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }

    // Reset detection results when a new file is selected
    setDetection(null);
  }, []);

  // Start watermark detection
  const detectWatermarks = useCallback(async () => {
    if (!file) {
      toast.error("Please select a file to check for watermarks");
      return;
    }

    setLoading(true);

    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Detect watermark
      const result = await detectWatermark(buffer, file.type);

      // Set detection results
      setDetection(result);

      // Switch to results tab
      setActiveTab("results");

      // Call the callback if provided
      if (onDetectionComplete) {
        onDetectionComplete(result);
      }

      // Show appropriate toast message
      if (result.hasWatermark) {
        toast.success("Watermark detected in this file");
      } else if (result.error) {
        toast.error(`Detection error: ${result.error}`);
      } else {
        toast.info("No watermark detected in this file");
      }
    } catch (error) {
      console.error("Error detecting watermark:", error);
      toast.error("Failed to detect watermark");

      setDetection({
        hasWatermark: false,
        isVisible: false,
        confidence: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  }, [file, onDetectionComplete]);

  // Clean up preview URL when component unmounts or file changes
  const cleanupPreview = useCallback(() => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
  }, [filePreview]);

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Fingerprint className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            Watermark Detector
          </CardTitle>

          <Badge
            variant="outline"
            className="bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 dark:from-violet-900/30 dark:to-indigo-900/30 dark:text-violet-300"
          >
            Advanced Feature
          </Badge>
        </div>
        <CardDescription>
          Detect visible and invisible watermarks in media files
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        <Tabs value={activeTab} onValueChange={activeTab => setActiveTab(activeTab as "upload" | "results")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <FileCheck className="h-4 w-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!detection}>
              <Eye className="h-4 w-4 mr-2" />
              Detection Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4 space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="file-input">Select file to check for watermarks</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept="image/*,video/*,audio/*,text/plain,text/html,application/pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: images, videos, audio, text files, HTML, and PDFs
                </p>
              </div>

              {filePreview && (
                <div className="border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900 p-2 flex justify-center">
                  <img
                    src={filePreview}
                    alt="File preview"
                    className="max-h-[200px] max-w-full object-contain"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Advanced Detection Options</Label>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="advanced-toggle"
                      checked={advancedOptions.enhancedDetection}
                      onCheckedChange={(checked) =>
                        setAdvancedOptions(prev => ({ ...prev, enhancedDetection: !!checked }))
                      }
                    />
                    <Label
                      htmlFor="advanced-toggle"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enable enhanced detection
                    </Label>
                  </div>
                </div>

                <div className={advancedOptions.enhancedDetection ? "grid gap-4 p-3 border rounded-md bg-muted/50" : "hidden"}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="invisible-toggle"
                      checked={advancedOptions.detectInvisible}
                      onCheckedChange={(checked) =>
                        setAdvancedOptions(prev => ({ ...prev, detectInvisible: !!checked }))
                      }
                    />
                    <Label
                      htmlFor="invisible-toggle"
                      className="text-sm font-medium leading-none"
                    >
                      Detect invisible watermarks
                    </Label>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label
                        htmlFor="confidence-threshold"
                        className="text-sm font-medium"
                      >
                        Confidence Threshold: {advancedOptions.confidenceThreshold}%
                      </Label>
                    </div>
                    <Input
                      id="confidence-threshold"
                      type="range"
                      min="0"
                      max="100"
                      value={advancedOptions.confidenceThreshold}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        confidenceThreshold: Number.parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values reduce false positives but might miss subtle watermarks
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-4 space-y-4">
            {detection ? (
              <>
                <Alert variant={detection.hasWatermark ? "success" : detection.error ? "destructive" : "warning"}>
                  {detection.hasWatermark ? (
                    <Check className="h-4 w-4" />
                  ) : detection.error ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {detection.hasWatermark
                      ? `Watermark detected with ${detection.confidence}% confidence`
                      : detection.error
                        ? `Error during detection: ${detection.error}`
                        : "No watermark detected in this file"}
                  </AlertDescription>
                </Alert>

                {detection.hasWatermark && (
                  <div className="space-y-2 mt-2">
                    <h3 className="text-sm font-medium">Detection Details</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Detection Confidence</span>
                          <span className="text-sm font-medium">{detection.confidence}%</span>
                        </div>
                        <Progress value={detection.confidence} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Watermark Type:</span>{" "}
                          <Badge variant="outline">
                            {detection.isVisible ? "Visible" : "Invisible"}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">File Type:</span>{" "}
                          <span className="font-mono">{file?.type || "Unknown"}</span>
                        </div>
                      </div>

                      {detection.extractedData && Object.keys(detection.extractedData).length > 0 && (
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Extracted Metadata</h4>
                          <div className="bg-muted p-3 rounded-md">
                            <pre className="text-xs overflow-auto whitespace-pre-wrap">
                              {JSON.stringify(detection.extractedData, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!detection.hasWatermark && !detection.error && (
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-md">
                    <FileX className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      No watermark was detected in this file.
                    </p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      This could mean the file does not contain a watermark, or the watermark is in a format
                      this detector cannot recognize.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-4">
                <Shield className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload a file to check for watermarks
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex gap-2 justify-end border-t p-4">
        {activeTab === "upload" ? (
          <Button
            onClick={detectWatermarks}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Fingerprint className="h-4 w-4 mr-2" />
                Detect Watermarks
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              cleanupPreview();
              setFile(null);
              setFilePreview(null);
              setActiveTab("upload");
            }}
          >
            Check Another File
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
