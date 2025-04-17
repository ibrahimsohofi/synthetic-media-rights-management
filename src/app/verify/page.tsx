"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, SearchIcon, FileSearchIcon, ScanIcon, FileWarningIcon } from "lucide-react";
import { QRScanner } from "@/components/ui/qr-scanner";

export default function VerifyPage() {
  const router = useRouter();
  const [certificateHash, setCertificateHash] = useState("");
  const [batchHashes, setBatchHashes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSingleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateHash.trim()) {
      setError("Please enter a certificate hash or ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clean the input in case the user copied a full URL
      const cleanHash = certificateHash.trim().split("/").pop() || certificateHash.trim();
      router.push(`/verify/${cleanHash}`);
    } catch (err) {
      setError("Invalid certificate hash format");
      setIsLoading(false);
    }
  };

  const handleBatchVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchHashes.trim()) {
      setError("Please enter at least one certificate hash or ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Process batch hashes
      const hashesArray = batchHashes
        .split(/[\n,]/)
        .map(hash => hash.trim())
        .filter(hash => hash.length > 0);

      if (hashesArray.length === 0) {
        setError("No valid hashes found");
        setIsLoading(false);
        return;
      }

      if (hashesArray.length === 1) {
        // If there's only one hash, redirect to the single verification page
        router.push(`/verify/${hashesArray[0]}`);
        return;
      }

      // For multiple hashes, encode them and redirect to the batch verification page
      const encodedHashes = encodeURIComponent(JSON.stringify(hashesArray));
      router.push(`/verify/batch?hashes=${encodedHashes}`);
    } catch (err) {
      setError("Error processing certificate hashes");
      setIsLoading(false);
    }
  };

  const handleQRCodeResult = (result: string) => {
    setShowScanner(false);
    if (result) {
      try {
        // Try to extract the hash from a URL if that's what the QR code contains
        let hash = result;

        // Check if it's a URL containing 'verify'
        if (result.includes('/verify/')) {
          hash = result.split('/verify/').pop() || result;
        }

        setCertificateHash(hash);
        // Automatically submit after scanning
        router.push(`/verify/${hash}`);
      } catch (err) {
        setError("Invalid QR code format");
      }
    }
  };

  return (
    <div className="container max-w-screen-md mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Certificate Verification</h1>
      <p className="text-muted-foreground mb-8">
        Verify the authenticity of a creative work by entering its certificate hash or ID, or scan a QR code.
      </p>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="single">Single Certificate</TabsTrigger>
          <TabsTrigger value="batch">Batch Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Verify a Certificate</CardTitle>
              <CardDescription>
                Enter a certificate hash, ID, or scan a QR code to verify the authenticity of a creative work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showScanner ? (
                <div className="space-y-4">
                  <QRScanner onResult={handleQRCodeResult} />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowScanner(false)}
                  >
                    Cancel Scanning
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSingleVerify} className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter certificate hash or ID"
                        value={certificateHash}
                        onChange={(e) => setCertificateHash(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowScanner(true)}
                        title="Scan QR Code"
                      >
                        <ScanIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Example: 0x8a4e9b8f72e3f8721b28490cfb51d675 or cert-1712345678901-abc123
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <FileWarningIcon className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⟳</span> Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <SearchIcon className="mr-2 h-4 w-4" /> Verify Certificate
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Certificate Verification</CardTitle>
              <CardDescription>
                Verify multiple certificates at once by entering their hashes or IDs, one per line or separated by commas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBatchVerify} className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Textarea
                    placeholder="Enter certificate hashes or IDs, one per line or separated by commas"
                    value={batchHashes}
                    onChange={(e) => setBatchHashes(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can enter up to 20 certificate hashes for batch verification.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <FileWarningIcon className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/30">
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    Batch verification allows you to quickly check multiple certificates to verify if they are authentic and registered in our system.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⟳</span> Verifying Batch...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FileSearchIcon className="mr-2 h-4 w-4" /> Verify Batch
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
