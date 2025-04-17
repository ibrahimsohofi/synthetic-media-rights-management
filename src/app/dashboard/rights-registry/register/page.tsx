"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AITrainingBadge } from "@/components/ui/ai-training-badge";
import { ArrowLeft, UploadCloud, AlertCircle, Info, Check, Lock, Shield } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/ui/file-upload";
import { registerCreativeWork } from "@/lib/actions/rights-registry";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AITrainingControls, type AITrainingSettings } from "@/components/ui/ai-training-controls";

export default function RightsRegistryRegisterPage() {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | "text">("image");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [keywords, setKeywords] = useState("");
  const [aiOptOut, setAiOptOut] = useState(true);
  const [aiTrainingSettings, setAiTrainingSettings] = useState<AITrainingSettings | null>(null);
  const [detectionEnabled, setDetectionEnabled] = useState(true);
  const [blockchainRegistration, setBlockchainRegistration] = useState(true);
  const [visibilityOption, setVisibilityOption] = useState<"PRIVATE" | "PUBLIC" | "LIMITED">("PRIVATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title) {
      setError("Please enter a title for your work");
      return;
    }

    if (uploadedFiles.length === 0) {
      setError("Please upload at least one file");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("type", mediaType.toUpperCase());
      formData.append("category", category || "Other");

      // For SQLite compatibility, we store files as comma-separated URLs
      // In a real implementation, we'd upload files to cloud storage and store their URLs
      const mockFileUrls = uploadedFiles.map(file =>
        `https://storage.example.com/${Date.now()}-${file.name.replace(/\s+/g, "-")}`).join(",");
      formData.append("fileUrls", mockFileUrls);

      // Mock thumbnail URL (would be generated in a real implementation)
      const thumbnailUrl = uploadedFiles.length > 0
        ? `https://storage.example.com/thumbnails/${Date.now()}-${uploadedFiles[0].name.replace(/\s+/g, "-")}`
        : "";
      formData.append("thumbnailUrl", thumbnailUrl);

      formData.append("aiTrainingOptOut", aiOptOut.toString());

      // Add AI training settings as JSON if available
      if (aiTrainingSettings) {
        formData.append("aiTrainingSettings", JSON.stringify(aiTrainingSettings));
      }

      formData.append("detectionEnabled", detectionEnabled.toString());
      formData.append("keywords", keywords);
      formData.append("visibility", visibilityOption);

      // Call the server action to register the work
      const result = await registerCreativeWork(formData);

      if (result.success) {
        // Show success message
        setShowSuccess(true);
        toast.success("Creative work registered successfully");

        // Reset form after delay
        setTimeout(() => {
          setShowSuccess(false);
          if (result.workId) {
            // Redirect to the work detail page
            router.push(`/dashboard/rights-registry/${result.workId}`);
          } else {
            // Reset form fields
            setTitle("");
            setDescription("");
            setCategory("");
            setKeywords("");
            setUploadedFiles([]);
          }
        }, 3000);
      } else {
        setError(result.message || "Registration failed. Please try again.");
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("An error occurred during registration. Please try again.");
      toast.error("Registration failed due to a system error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for AI Training Settings
  const handleAITrainingSettingsChange = (settings: AITrainingSettings) => {
    setAiTrainingSettings(settings);
    setAiOptOut(settings.optOut);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <Link
              href="/dashboard/rights-registry"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-1"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Rights Registry
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Register New Work</h1>
            <p className="text-muted-foreground">
              Register your synthetic media works to protect your rights
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Work Registration</CardTitle>
              <CardDescription>
                Fill out the details below to register your creative work in our secure registry
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
                    <p className="font-medium">Registration successful!</p>
                    <p>Your work has been registered and is now protected.</p>
                  </div>
                </div>
              )}

              {/* Media Type Selection */}
              <div className="space-y-3">
                <Label>Media Type</Label>
                <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as any)} className="w-full">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="image">Image</TabsTrigger>
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="audio">Audio</TabsTrigger>
                    <TabsTrigger value="text">Text</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter the title of your work"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed description of your work"
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital-art">Digital Art</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="illustration">Illustration</SelectItem>
                        <SelectItem value="3d-model">3D Model</SelectItem>
                        <SelectItem value="animation">Animation</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="sound-design">Sound Design</SelectItem>
                        <SelectItem value="voice-over">Voice Over</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Comma-separated keywords"
                    />
                    <p className="text-xs text-muted-foreground">
                      These help with discovery and detection
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label>Upload Files <span className="text-red-500">*</span></Label>
                <FileUpload
                  accept={
                    mediaType === "image" ? "image/*" :
                    mediaType === "video" ? "video/*" :
                    mediaType === "audio" ? "audio/*" :
                    ".txt,.doc,.docx,.pdf,.md"
                  }
                  maxSize={50}
                  maxFiles={5}
                  onChange={handleFileUpload}
                  uploadIcon={<UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />}
                  uploadText={
                    <>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mediaType === "image" ? "SVG, PNG, JPG or GIF" :
                         mediaType === "video" ? "MP4, WebM or MOV" :
                         mediaType === "audio" ? "MP3, WAV or OGG" :
                         "PDF, DOC, TXT or MD"}
                      </p>
                    </>
                  }
                />
              </div>

              {/* Protection Options */}
              <div className="space-y-4">
                <h3 className="text-base font-medium">Protection Options</h3>

                {/* Replace the old AI Training Opt-out with our new component */}
                <AITrainingControls
                  initialValue={aiOptOut}
                  onValueChange={setAiOptOut}
                  onDetailedSettingsChange={handleAITrainingSettingsChange}
                  workType={mediaType}
                />

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="detection"
                    checked={detectionEnabled}
                    onCheckedChange={(checked) => setDetectionEnabled(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="detection" className="font-medium cursor-pointer">Enable automatic detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow our system to scan the web for unauthorized use of your work
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="blockchain"
                    checked={blockchainRegistration}
                    onCheckedChange={(checked) => setBlockchainRegistration(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="blockchain" className="font-medium cursor-pointer">Blockchain registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Store a cryptographic proof of your registration on our secure blockchain
                    </p>
                  </div>
                </div>
              </div>

              {/* Visibility Settings */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Visibility Settings</Label>
                <RadioGroup
                  value={visibilityOption}
                  onValueChange={(value) => setVisibilityOption(value as any)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="PRIVATE" id="private" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="private" className="font-medium cursor-pointer">Private</Label>
                      <p className="text-sm text-muted-foreground">
                        Only visible to you and users you explicitly share with
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="LIMITED" id="limited" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="limited" className="font-medium cursor-pointer">Limited</Label>
                      <p className="text-sm text-muted-foreground">
                        Visible to licensees and in search results with limited details
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="PUBLIC" id="public" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="public" className="font-medium cursor-pointer">Public</Label>
                      <p className="text-sm text-muted-foreground">
                        Publicly viewable in the registry and marketplace
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
                  <p>Registration includes a fingerprint of your work that helps us detect unauthorized use. Your files will be securely stored and accessible only to you.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register Work"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
