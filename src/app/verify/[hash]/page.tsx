"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationCertificate } from "@/components/ui/verification-certificate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Shield,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  Loader2
} from "lucide-react";

export default function PublicVerificationPage() {
  const params = useParams();
  const metadataHash = params?.hash as string;

  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'verified' | 'failed' | 'not-found'>('loading');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // In a real application, this would make an API call to verify the hash
    // For now, we'll simulate the verification process
    const verifyHash = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For demo purposes: if hash starts with "0x", consider it valid
        if (metadataHash && metadataHash.startsWith("0x")) {
          setVerificationStatus('verified');
          // Mock verification data
          setVerificationData({
            workId: "842e63a7-5323-4e2b-9f91-8740eb4c5b33",
            workTitle: "Neural Network Generated Landscape Series #42",
            ownerName: "Content Creator",
            registeredAt: new Date("2025-03-12T14:32:56Z"),
            transactionId: "0x8a4e9b8f72e3f8721b28490cfb51d675b60a63cfb85a2df7b57f0e38cd1dcb77",
            blockNumber: 8945721,
            networkName: "Polygon",
            metadataHash: metadataHash,
            mediaType: "IMAGE",
            thumbnailUrl: "https://source.unsplash.com/random/800x600/?landscape,ai",
            verified: true,
          });
        } else if (metadataHash) {
          setVerificationStatus('failed');
          setErrorMessage('The hash could not be verified on the blockchain. This may indicate that the work has not been registered or the hash is invalid.');
        } else {
          setVerificationStatus('not-found');
          setErrorMessage('No verification hash was provided.');
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus('failed');
        setErrorMessage('An error occurred during verification. Please try again later.');
      }
    };

    verifyHash();
  }, [metadataHash]);

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-violet-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">SyntheticRights Verification</h1>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Verification Status */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationStatus === 'loading' && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span>Verification in Progress</span>
                </>
              )}
              {verificationStatus === 'verified' && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Verification Successful</span>
                </>
              )}
              {verificationStatus === 'failed' && (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>Verification Failed</span>
                </>
              )}
              {verificationStatus === 'not-found' && (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span>Hash Not Found</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationStatus === 'loading' && (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-4" />
                <p className="text-center text-muted-foreground">
                  Verifying metadata hash on the blockchain...
                </p>
              </div>
            )}

            {verificationStatus === 'failed' || verificationStatus === 'not-found' ? (
              <Alert variant="destructive" className="my-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            ) : null}

            {verificationStatus === 'verified' && verificationData && (
              <div className="space-y-6">
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700 dark:text-green-400">Authentic Work Confirmed</AlertTitle>
                  <AlertDescription className="text-green-700/80 dark:text-green-400/80">
                    This work has been verified on the blockchain and is registered with SyntheticRights.
                  </AlertDescription>
                </Alert>

                <VerificationCertificate
                  workId={verificationData.workId}
                  workTitle={verificationData.workTitle}
                  ownerName={verificationData.ownerName}
                  registeredAt={new Date(verificationData.registeredAt)}
                  transactionId={verificationData.transactionId}
                  blockNumber={verificationData.blockNumber}
                  networkName={verificationData.networkName}
                  metadataHash={verificationData.metadataHash}
                  mediaType={verificationData.mediaType}
                  thumbnailUrl={verificationData.thumbnailUrl}
                  verified={verificationData.verified}
                />
              </div>
            )}
          </CardContent>
          {verificationStatus === 'verified' && (
            <CardFooter className="bg-muted/10 border-t p-4 flex flex-wrap gap-3">
              <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                Verified on {new Date().toLocaleDateString()}
              </Badge>
              <div className="ml-auto">
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={`https://polygonscan.com/tx/${verificationData?.transactionId}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on Block Explorer
                  </a>
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Information Section */}
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">What is this page?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This verification page allows anyone to verify the authenticity of synthetic media
                registered through SyntheticRights. Each work has a unique cryptographic hash that
                is stored on the blockchain, providing an immutable record of ownership.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">How verification works</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                SyntheticRights uses blockchain technology to create a secure, tamper-proof record
                of digital content. When a work is registered, its metadata is hashed and stored
                on the blockchain, creating a permanent timestamp of ownership.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Protecting your rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                By registering your synthetic media with SyntheticRights, you create verifiable proof
                of ownership that can help protect your intellectual property rights and simplify
                licensing to third parties.
              </p>
              <Button variant="link" size="sm" className="mt-2 px-0" asChild>
                <Link href="/register">Register your work →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
