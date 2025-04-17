"use client";

import { useState } from "react";
import { AlertCircle, Check, Upload, FilePlus, FileQuestion, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const fileSchema = z.object({
  verifyMethod: z.enum(["file", "hash"]),
  file: z.instanceof(FileList).optional(),
  metadataHash: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("private"),
  additionalInfo: z.string().optional(),
});

type VerificationFormValues = z.infer<typeof fileSchema>;

export function VerificationForm() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    matchPercentage?: number;
    workId?: string;
    ownerName?: string;
    registrationDate?: string;
    error?: string;
  } | null>(null);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      verifyMethod: "file",
      visibility: "private",
      additionalInfo: "",
    },
  });

  const verifyMethod = form.watch("verifyMethod");
  const selectedFile = form.watch("file");
  const fileName = selectedFile?.[0]?.name || "";

  async function onSubmit(data: VerificationFormValues) {
    setIsVerifying(true);

    try {
      // In a real implementation, this would actually verify the file/hash
      // by calling a blockchain verification API

      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, always return a success
      setVerificationResult({
        verified: true,
        matchPercentage: 98,
        workId: "842e63a7-5323-4e2b-9f91-8740eb4c5b33",
        ownerName: "Content Creator",
        registrationDate: "March 12, 2025",
      });
    } catch (error) {
      setVerificationResult({
        verified: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during verification"
      });
    } finally {
      setIsVerifying(false);
    }
  }

  function resetForm() {
    form.reset();
    setVerificationResult(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Content Authenticity</CardTitle>
        <CardDescription>
          Check if synthetic media content has been registered on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verificationResult ? (
          <div className="space-y-4">
            <Alert variant={verificationResult.verified ? "success" : "destructive"}>
              <div className="flex items-center gap-2">
                {verificationResult.verified ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                  {verificationResult.verified ? "Content Verified" : "Verification Failed"}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {verificationResult.verified ? (
                  <div className="space-y-2">
                    <p>This content has been verified as registered on the blockchain.</p>
                    {verificationResult.matchPercentage && (
                      <div className="flex items-center gap-2">
                        <span>Match confidence:</span>
                        <Badge variant="outline" className="font-mono">
                          {verificationResult.matchPercentage}%
                        </Badge>
                      </div>
                    )}
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Registered by:</span>
                        <span>{verificationResult.ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Registration date:</span>
                        <span>{verificationResult.registrationDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Work ID:</span>
                        <span className="font-mono text-xs">{verificationResult.workId}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>{verificationResult.error || "Content could not be verified on the blockchain"}</p>
                )}
              </AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <Button onClick={resetForm}>Verify Another</Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="file" className="w-full"
                onValueChange={(value) => form.setValue("verifyMethod", value as "file" | "hash")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="file">Verify by File</TabsTrigger>
                  <TabsTrigger value="hash">Verify by Hash</TabsTrigger>
                </TabsList>
                <TabsContent value="file" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Upload Content</FormLabel>
                        <FormControl>
                          <div className="grid gap-2">
                            <Input
                              type="file"
                              className={fileName ? "hidden" : ""}
                              onChange={(e) => {
                                onChange(e.target.files || null);
                                form.setValue("verifyMethod", "file");
                              }}
                              {...rest}
                            />
                            {fileName && (
                              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                                <FilePlus className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm truncate flex-1">{fileName}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onChange(null)}
                                >
                                  Change
                                </Button>
                              </div>
                            )}
                            {!fileName && (
                              <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2 text-center">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">Drag and drop a file or click to browse</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Upload the content you want to verify
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Supported formats: JPG, PNG, GIF, MP4, MP3, WAV, PDF
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="hash" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metadataHash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Hash</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter the content hash (e.g., 0x8a4e9...)"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.setValue("verifyMethod", "hash");
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Use the metadata hash if you want to verify without uploading the content
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Verification Visibility</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="private" id="private" />
                          <div className="grid gap-1">
                            <label
                              htmlFor="private"
                              className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1.5"
                            >
                              <EyeOff className="h-3.5 w-3.5" /> Private Verification
                            </label>
                            <p className="text-sm text-muted-foreground">
                              Content is only checked against the blockchain and not stored
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="public" id="public" />
                          <div className="grid gap-1">
                            <label
                              htmlFor="public"
                              className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" /> Public Verification
                            </label>
                            <p className="text-sm text-muted-foreground">
                              Verification will be logged in the public verification registry
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional context about this verification..."
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add details about why you're verifying this content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Content"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex-col space-y-2 text-center border-t pt-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <FileQuestion className="h-4 w-4" />
          <p>Need help with verification? <a href="/dashboard/support/articles/verification-guide" className="text-primary hover:underline">View the verification guide</a></p>
        </div>
      </CardFooter>
    </Card>
  );
}
