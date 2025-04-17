"use client";

import { useState } from "react";
import { Badge, ShieldCheck, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface GenerateCertificateButtonProps {
  workId: string;
  hasBlockchainRecord?: boolean;
  onSuccess?: (certificateId: string) => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  asIcon?: boolean;
}

export function GenerateCertificateButton({
  workId,
  hasBlockchainRecord = false,
  onSuccess,
  variant = "default",
  size = "default",
  className = "",
  asIcon = false
}: GenerateCertificateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateType, setCertificateType] = useState<string>("standard");
  const [registerOnBlockchain, setRegisterOnBlockchain] = useState<boolean>(!hasBlockchainRecord);
  const [error, setError] = useState<string | null>(null);
  const [successCertificateId, setSuccessCertificateId] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccessCertificateId(null);

    try {
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workId,
          certificateType,
          registerOnBlockchain: registerOnBlockchain && !hasBlockchainRecord
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate certificate');
      }

      if (data.certificate?.metadata?.certificateId) {
        setSuccessCertificateId(data.certificate.metadata.certificateId);
        toast.success("Certificate generated successfully");

        if (onSuccess) {
          onSuccess(data.certificate.metadata.certificateId);
        }
      } else {
        throw new Error('Certificate ID not found in response');
      }
    } catch (err) {
      console.error('Error generating certificate:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast.error("Failed to generate certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (successCertificateId && onSuccess) {
      // If we have a success ID and a callback, make sure the callback is triggered
      // before closing the dialog
      onSuccess(successCertificateId);
    }
    setIsOpen(false);
  };

  const handleRedirectToCertificate = () => {
    if (successCertificateId) {
      // We'll close the dialog and the onSuccess callback will handle the redirect
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {asIcon ? (
          <Button variant="ghost" size="icon" className={className}>
            <Badge className="h-4 w-4" />
            <span className="sr-only">Generate Certificate</span>
          </Button>
        ) : (
          <Button variant={variant} size={size} className={`gap-2 ${className}`}>
            <ShieldCheck className="h-4 w-4" />
            <span>Generate Certificate</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!successCertificateId ? (
          <>
            <DialogHeader>
              <DialogTitle>Generate Authenticity Certificate</DialogTitle>
              <DialogDescription>
                Create a verifiable certificate of authenticity for your creative work.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {error && (
                <Alert variant="destructive" className="p-3">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="certificate-type">Certificate Type</Label>
                <Select
                  value={certificateType}
                  onValueChange={setCertificateType}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="certificate-type">
                    <SelectValue placeholder="Select certificate type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Standard Certificate</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="premium">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Premium Certificate</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {certificateType === "premium" ?
                    "Premium certificates include enhanced verification and never expire." :
                    "Standard certificates are valid for 1 year and can be renewed."}
                </p>
              </div>

              {!hasBlockchainRecord && (
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="blockchain-registration">Register on Blockchain</Label>
                    <p className="text-xs text-muted-foreground">
                      Register this work on the blockchain for permanent verification
                    </p>
                  </div>
                  <Switch
                    id="blockchain-registration"
                    checked={registerOnBlockchain}
                    onCheckedChange={setRegisterOnBlockchain}
                    disabled={isGenerating}
                  />
                </div>
              )}

              {hasBlockchainRecord && (
                <Alert variant="success" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-md text-sm">
                  <AlertDescription>
                    This work is already registered on the blockchain.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Generate Certificate
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Certificate Generated Successfully</DialogTitle>
              <DialogDescription>
                Your certificate has been created and is ready to view.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert variant="success" className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-md">
                <AlertDescription className="flex flex-col items-center text-center py-2 space-y-2">
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p>
                    Certificate ID: <span className="font-mono">{successCertificateId.substring(0, 10)}...</span>
                  </p>
                  <p className="text-sm">
                    You can now view, download or share your certificate.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Close
              </Button>
              <Button
                onClick={handleRedirectToCertificate}
                className="gap-2"
              >
                View Certificate <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
