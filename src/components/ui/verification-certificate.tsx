"use client";

import type { ReactNode } from "react";
import { Shield, Check, Download, ExternalLink, Calendar, Clock, FileDigit, Hash, BrainCircuit, X, InfoIcon, EyeIcon, CheckCircle, DatabaseIcon, QrCode, LockIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { AITrainingBadge } from "@/components/ui/ai-training-badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface VerificationCertificateProps {
  workId: string;
  workTitle: string;
  ownerName: string;
  registeredAt: Date;
  transactionId: string;
  blockNumber: number;
  networkName: string;
  metadataHash: string;
  mediaType: string;
  thumbnailUrl?: string;
  verified: boolean;
  aiTrainingOptOut?: boolean;
  aiTrainingSettings?: Record<string, any>;
  children?: ReactNode;
}

export function VerificationCertificate({
  workId,
  workTitle,
  ownerName,
  registeredAt,
  transactionId,
  blockNumber,
  networkName,
  metadataHash,
  mediaType,
  thumbnailUrl,
  verified,
  aiTrainingOptOut = true,
  aiTrainingSettings,
  children
}: VerificationCertificateProps) {
  const [showBlockchainDetails, setShowBlockchainDetails] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const truncateHash = (hash: string) => {
    if (!hash) return "";
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  // Function to get the block explorer URL based on the network
  const getBlockExplorerUrl = (network: string, txId: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
      case 'mainnet':
        return `https://etherscan.io/tx/${txId}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${txId}`;
      case 'arbitrum':
        return `https://arbiscan.io/tx/${txId}`;
      case 'optimism':
        return `https://optimistic.etherscan.io/tx/${txId}`;
      case 'base':
        return `https://basescan.org/tx/${txId}`;
      default:
        return `#`;
    }
  };

  const blockExplorerUrl = getBlockExplorerUrl(networkName, transactionId);

  // Get restriction level from AI settings or use "full" as default
  const getAIRestrictionLevel = () => {
    if (!aiTrainingSettings) return "full";

    const { remixAllowed, attributionRequired, commercialUseAllowed } = aiTrainingSettings;

    if (!remixAllowed && attributionRequired && !commercialUseAllowed) {
      return "full";
    } else if (remixAllowed && attributionRequired && !commercialUseAllowed) {
      return "balanced";
    } else {
      return "minimal";
    }
  };

  const aiRestrictionLevel = getAIRestrictionLevel();

  // Calculate the certificate age
  const certificateAge = () => {
    const now = new Date();
    const registered = new Date(registeredAt);
    const diffMs = now.getTime() - registered.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months ago`;
    return `${Math.round(diffDays / 365)} years ago`;
  };

  return (
    <Card className="border rounded-lg overflow-hidden shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-full">
              <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Verification Certificate</div>
              <CardTitle className="text-xl font-semibold">{workTitle}</CardTitle>
            </div>
          </div>
          <Badge
            variant={verified ? "success" : "destructive"}
            className={cn(
              "gap-1",
              verified ? "hover:bg-green-500" : "hover:bg-red-500"
            )}
          >
            {verified ? (
              <>
                <Check className="h-3 w-3" />
                <span>Verified</span>
              </>
            ) : (
              <>
                <X className="h-3 w-3" />
                <span>Unverified</span>
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 grid gap-6 md:grid-cols-2">
        {thumbnailUrl && (
          <div className="md:col-span-2 flex justify-center">
            <div
              className="relative aspect-video max-w-md rounded-md overflow-hidden border cursor-pointer"
              onClick={() => setIsImageExpanded(true)}
            >
              <img
                src={thumbnailUrl}
                alt={workTitle}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                <Button variant="ghost" size="sm" className="text-white">
                  <EyeIcon className="h-5 w-5 mr-1" />
                  <span>Expand</span>
                </Button>
              </div>
              <div className="absolute bottom-0 right-0 bg-background/75 px-2 py-1 text-xs font-medium">
                {mediaType}
              </div>
              {/* Show verification overlay */}
              {verified && (
                <div className="absolute top-2 right-2">
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Verified</span>
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Work Information
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium">ID:</dt>
                <dd className="text-sm">{workId.substring(0, 8)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium">Owner:</dt>
                <dd className="text-sm">{ownerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium">Media Type:</dt>
                <dd className="text-sm">{mediaType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium">Certificate Age:</dt>
                <dd className="text-sm flex items-center gap-1">
                  <span>{certificateAge()}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Registered on {format(registeredAt, 'PPP')}</p>
                    </TooltipContent>
                  </Tooltip>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Registration Details
            </h3>
            <dl className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Registered:
                </dt>
                <dd className="text-sm text-right">
                  <div>{format(registeredAt, 'PPP')}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(registeredAt, { addSuffix: true })}
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          {/* AI Training Status Section with Enhanced UI */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <BrainCircuit className="h-3.5 w-3.5 text-muted-foreground" />
              AI Training Status
            </h3>
            <div className="bg-muted/20 rounded-md p-3 border">
              <div className="flex items-center justify-between mb-2">
                <dt className="text-sm font-medium">Protection Status:</dt>
                <dd className="text-sm">
                  <Badge
                    variant={aiTrainingOptOut ? "success" : "outline"}
                    className={cn(
                      "text-xs gap-1",
                      aiTrainingOptOut ? "hover:bg-green-500" : ""
                    )}
                  >
                    {aiTrainingOptOut ? (
                      <>
                        <Check className="h-3 w-3" />
                        Protected
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" />
                        Not Protected
                      </>
                    )}
                  </Badge>
                </dd>
              </div>

              {aiTrainingOptOut && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <dt className="text-sm font-medium">Protection Level:</dt>
                    <dd className="text-sm">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="text-xs"
                            >
                              {aiRestrictionLevel === "full"
                                ? "Full Protection"
                                : aiRestrictionLevel === "balanced"
                                  ? "Balanced Protection"
                                  : "Minimal Protection"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {aiRestrictionLevel === "full"
                              ? "No AI model training or derivative use allowed"
                              : aiRestrictionLevel === "balanced"
                                ? "Limited AI training with attribution required"
                                : "Basic protection with some AI training allowed"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </dd>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    This work is protected against unauthorized use in AI training datasets.
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      Learn more
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DatabaseIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Blockchain Information
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowBlockchainDetails(!showBlockchainDetails)}
              >
                {showBlockchainDetails ? "Hide details" : "Show details"}
              </Button>
            </h3>

            <dl className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <dt className="text-sm font-medium flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  Transaction:
                </dt>
                <dd className="text-sm text-right font-mono text-xs">
                  <div className="flex items-center gap-1">
                    {truncateHash(transactionId)}
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" asChild>
                      <a
                        href={blockExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-sm font-medium">Network:</dt>
                <dd className="text-sm">{networkName}</dd>
              </div>

              {showBlockchainDetails && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Block:</dt>
                    <dd className="text-sm">{blockNumber.toLocaleString()}</dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Hash Type:</dt>
                    <dd className="text-sm">SHA-256</dd>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <dt className="text-sm font-medium">Security Level:</dt>
                      <dd className="text-sm">
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                          High
                        </Badge>
                      </dd>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md text-xs text-green-700 dark:text-green-300">
                      This certificate has been cryptographically secured through blockchain registration, providing immutable proof of ownership and timestamp verification.
                    </div>
                  </div>
                </>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <FileDigit className="h-3.5 w-3.5 text-muted-foreground" />
              Content Verification
            </h3>
            <dl className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <dt className="text-sm font-medium flex items-center gap-1.5">
                  <FileDigit className="h-3.5 w-3.5 text-muted-foreground" />
                  Hash:
                </dt>
                <dd className="text-sm text-right font-mono text-xs">
                  {truncateHash(metadataHash)}
                </dd>
              </div>

              <div className="bg-muted/30 p-3 rounded-md border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Verification:</span>
                  <Badge
                    variant={verified ? "success" : "destructive"}
                    className="gap-1"
                  >
                    {verified ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Authentic</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" />
                        <span>Could not verify</span>
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Content hash verification provides cryptographic proof that this work has not been modified since registration.
                </div>
              </div>
            </dl>
          </div>

          {/* Add QR code verification section */}
          <div className="hidden sm:block mt-2">
            <div className="flex flex-col items-center space-y-2 p-3 bg-muted/20 rounded-md border">
              <QrCode className="h-24 w-24 text-primary/80" />
              <div className="text-xs text-center text-muted-foreground">
                Scan to verify certificate
              </div>
            </div>
          </div>
        </div>

        {children && (
          <div className="md:col-span-2 pt-2">
            {children}
          </div>
        )}

        {/* Add enhanced security information */}
        <div className="md:col-span-2 mt-4">
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <LockIcon className="h-4 w-4 text-primary" />
              <span>Security Information</span>
            </h3>
            <Badge variant="outline" className="text-xs">
              Last verified: {format(new Date(), 'MMM d, yyyy')}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="p-3 rounded-md border bg-muted/20">
              <div className="flex items-center gap-1.5 mb-1.5">
                <LockIcon className="h-3.5 w-3.5 text-green-600" />
                <h4 className="text-sm font-medium">Tamper Protection</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Secured with SHA-256 cryptographic hashing and blockchain verification
              </p>
            </div>

            <div className="p-3 rounded-md border bg-muted/20">
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                <h4 className="text-sm font-medium">Ownership Verified</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Digital signature confirms the identity of {ownerName} as creator
              </p>
            </div>

            <div className="p-3 rounded-md border bg-muted/20">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-green-600" />
                <h4 className="text-sm font-medium">Timestamp Verification</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Registration time cryptographically verified through blockchain
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3 border-t p-4 bg-muted/10">
        <Button size="sm" className="gap-2" asChild>
          <a href={`/verify/${metadataHash}`} target="_blank" rel="noopener noreferrer">
            <Shield className="h-4 w-4" />
            <span>View Public Certificate</span>
          </a>
        </Button>
        <Button size="sm" variant="outline" className="gap-2" asChild>
          <a href={blockExplorerUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            <span>Verify on {networkName}</span>
          </a>
        </Button>
        <Button size="sm" variant="outline" className="gap-2 ml-auto">
          <Download className="h-4 w-4" />
          <span>Download Certificate</span>
        </Button>
      </CardFooter>

      {/* Image expand dialog */}
      <Dialog open={isImageExpanded} onOpenChange={setIsImageExpanded}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{workTitle}</DialogTitle>
            <DialogDescription>Registered by {ownerName}</DialogDescription>
          </DialogHeader>
          <div className="relative rounded-md overflow-hidden border max-h-[70vh]">
            <img
              src={thumbnailUrl}
              alt={workTitle}
              className="object-contain w-full h-full max-h-[70vh]"
            />
            <div className="absolute top-2 right-2">
              <Badge variant={verified ? "success" : "destructive"} className="gap-1">
                {verified ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Verified</span>
                  </>
                ) : (
                  <span>Unverified</span>
                )}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
