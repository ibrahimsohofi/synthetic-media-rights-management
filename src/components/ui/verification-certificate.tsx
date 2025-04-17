"use client";

import type { ReactNode } from "react";
import { Shield, Check, Download, ExternalLink, Calendar, Clock, FileDigit, Hash, BrainCircuit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { AITrainingBadge } from "@/components/ui/ai-training-badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      </CardHeader>

      <CardContent className="p-6 grid gap-6 md:grid-cols-2">
        {thumbnailUrl && (
          <div className="md:col-span-2 flex justify-center">
            <div className="relative aspect-video max-w-md rounded-md overflow-hidden border">
              <img
                src={thumbnailUrl}
                alt={workTitle}
                className="object-cover w-full h-full"
              />
              <div className="absolute bottom-0 right-0 bg-background/75 px-2 py-1 text-xs font-medium">
                {mediaType}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Work Information</h3>
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
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Registration Details</h3>
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

          {/* AI Training Status Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <BrainCircuit className="h-3.5 w-3.5 text-muted-foreground" />
              AI Training Status
            </h3>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium">AI Training Opt-out:</dt>
                <dd className="text-sm">
                  <Badge
                    variant={aiTrainingOptOut ? "success" : "outline"}
                    className="text-xs gap-1"
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
                <div className="flex items-center justify-between">
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
              )}
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Blockchain Information</h3>
            <dl className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <dt className="text-sm font-medium flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  Transaction:
                </dt>
                <dd className="text-sm text-right font-mono text-xs">
                  {truncateHash(transactionId)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium">Block:</dt>
                <dd className="text-sm">{blockNumber.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium">Network:</dt>
                <dd className="text-sm">{networkName}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Content Verification</h3>
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
            </dl>
          </div>
        </div>

        {children && (
          <div className="md:col-span-2 pt-2">
            {children}
          </div>
        )}
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
      </CardFooter>
    </Card>
  );
}
