"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getTransactionExplorerUrl } from "@/lib/ethereum-utils";
import { verifyCertificateOnBlockchain } from "@/lib/ethereum-utils";
import { Loader2, Shield, ExternalLink, AlertTriangle, Check, Info } from "lucide-react";

interface BlockchainVerificationProps {
  certificateId: string;
  metadataHash: string;
  transactionId?: string;
  blockNumber?: number;
  networkName?: string;
  isPremium: boolean;
  onVerified?: (result: { verified: boolean; timestamp?: Date; ownerAddress?: string }) => void;
}

export function BlockchainVerification({
  certificateId,
  metadataHash,
  transactionId,
  blockNumber,
  networkName = "sepolia",
  isPremium,
  onVerified
}: BlockchainVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    timestamp?: Date;
    ownerAddress?: string;
    revoked?: boolean;
    error?: string;
  } | null>(null);

  // Format an address for display
  const formatAddress = (address?: string) => {
    if (!address) return "Unknown";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Verify the certificate on the blockchain
  const verifyOnBlockchain = async () => {
    if (!metadataHash || !certificateId) return;

    setLoading(true);
    try {
      // In a production app, this would call a real blockchain node
      const result = await verifyCertificateOnBlockchain(certificateId, metadataHash, networkName);

      setVerificationResult(result);

      if (onVerified) {
        onVerified({
          verified: result.verified,
          timestamp: result.timestamp,
          ownerAddress: result.ownerAddress
        });
      }
    } catch (error) {
      console.error("Blockchain verification error:", error);
      setVerificationResult({
        verified: false,
        error: "Failed to connect to blockchain network"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get the transaction explorer URL
  const explorerUrl = transactionId ? getTransactionExplorerUrl(transactionId, networkName) : "#";

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950/50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Blockchain Verification</CardTitle>
          </div>
          {isPremium ? (
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-blue-200 to-violet-200 text-blue-700 dark:from-blue-800/40 dark:to-violet-800/40 dark:text-blue-300"
            >
              Premium Feature
            </Badge>
          ) : (
            <Badge variant="outline" className="border-dashed">
              Standard
            </Badge>
          )}
        </div>
        <CardDescription>
          {isPremium
            ? "Verify this certificate's authenticity on the blockchain"
            : "Upgrade to Premium to access blockchain verification"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        {!isPremium ? (
          <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/50">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Premium certificates include immutable blockchain verification, providing the highest
              level of protection and authenticity for your synthetic media rights.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {transactionId ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm font-mono">
                            {transactionId.substring(0, 10)}...{transactionId.substring(transactionId.length - 8)}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs break-all">{transactionId}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Network</p>
                    <p className="text-sm">{networkName}</p>
                  </div>
                  {blockNumber && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Block Number</p>
                      <p className="text-sm font-mono">{blockNumber.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {verificationResult && (
                  <Alert
                    variant={verificationResult.verified ? "success" : "destructive"}
                    className={`text-sm ${verificationResult.verified
                      ? "bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300 border-green-200 dark:border-green-800/50"
                      : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300 border-red-200 dark:border-red-800/50"}`}
                  >
                    {verificationResult.verified ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {verificationResult.verified
                        ? verificationResult.revoked
                          ? "Certificate was found on the blockchain but has been revoked."
                          : "Certificate verified on blockchain. Authenticity confirmed."
                        : verificationResult.error || "Certificate verification failed."}
                    </AlertDescription>
                  </Alert>
                )}

                {verificationResult?.verified && verificationResult.timestamp && (
                  <div className="space-y-1 bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium">Verification Details</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Registered:</span>{" "}
                        {verificationResult.timestamp.toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Owner:</span>{" "}
                        {formatAddress(verificationResult.ownerAddress)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="warning" className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This certificate is not registered on the blockchain yet. You can register it by generating a new premium certificate.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3 justify-between border-t pt-4">
        {isPremium && transactionId && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={verifyOnBlockchain}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify on Blockchain
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
            >
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Explorer
              </a>
            </Button>
          </>
        )}

        {isPremium && !transactionId && (
          <Button variant="secondary" className="w-full" disabled>
            <Shield className="mr-2 h-4 w-4" />
            Not yet registered on blockchain
          </Button>
        )}

        {!isPremium && (
          <Button variant="default" className="w-full">
            <Shield className="mr-2 h-4 w-4" />
            Upgrade to Premium
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
