"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface GenerateCertificateButtonProps {
  workId: string;
  workTitle: string;
  hasBlockchainRegistration: boolean;
  onCertificateGenerated?: (certificateId: string) => void;
}

export function GenerateCertificateButton({
  workId,
  workTitle,
  hasBlockchainRegistration,
  onCertificateGenerated,
}: GenerateCertificateButtonProps) {
  const [open, setOpen] = useState(false);
  const [certificateType, setCertificateType] = useState<string>("standard");
  const [registerBlockchain, setRegisterBlockchain] = useState(!hasBlockchainRegistration);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  const handleCertificateTypeChange = (value: string) => {
    setCertificateType(value);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workId,
          certificateType,
          registerOnBlockchain: registerBlockchain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate certificate");
      }

      // Success
      setSuccess(true);
      setCertificateId(data.certificate.metadata.certificateId);

      // Callback to parent component if needed
      if (onCertificateGenerated) {
        onCertificateGenerated(data.certificate.metadata.certificateId);
      }

      toast.success("Certificate generated successfully!");
    } catch (err) {
      console.error("Certificate generation error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to generate certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Reset state when closing
    if (!newOpen) {
      setSuccess(false);
      setError(null);
    }
    setOpen(newOpen);
  };

  const viewCertificate = () => {
    if (certificateId) {
      window.open(`/dashboard/rights-registry/certificate/${certificateId}`, "_blank");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Generate Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Verification Certificate</DialogTitle>
          <DialogDescription>
            Create a verification certificate that proves your ownership and authenticity of this work.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <div className="space-y-4 py-4">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                Certificate successfully generated for "{workTitle}"
              </AlertDescription>
            </Alert>
            <div className="flex flex-col items-center justify-center p-6 border rounded-md bg-muted/20">
              <Shield className="h-12 w-12 text-violet-500 mb-4" />
              <h3 className="text-lg font-medium">Certificate Ready</h3>
              <p className="text-sm text-muted-foreground text-center mt-2 mb-4">
                Your verification certificate has been created and is ready to view.
              </p>
              <Button className="mt-2" onClick={viewCertificate}>
                View Certificate
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certificate-type">Certificate Type</Label>
              <Select onValueChange={handleCertificateTypeChange} defaultValue="standard">
                <SelectTrigger id="certificate-type">
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    <div className="flex items-center justify-between w-full">
                      <span>Standard</span>
                      <Badge variant="outline">Free</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="premium">
                    <div className="flex items-center justify-between w-full">
                      <span>Premium</span>
                      <Badge variant="outline">$5.00</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="enhanced">
                    <div className="flex items-center justify-between w-full">
                      <span>Enhanced</span>
                      <Badge variant="outline">$10.00</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Standard certificates expire in 1 year. Premium and Enhanced certificates never expire.
              </p>
            </div>

            {!hasBlockchainRegistration && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="blockchain-registration"
                    checked={registerBlockchain}
                    onCheckedChange={(checked) => setRegisterBlockchain(checked as boolean)}
                  />
                  <Label htmlFor="blockchain-registration" className="cursor-pointer">
                    Register on blockchain
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  This will create an immutable record of your work on our blockchain network.
                </p>
              </div>
            )}

            {certificateType === "premium" && (
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30">
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  Premium certificates include content fingerprinting and detailed metadata.
                </AlertDescription>
              </Alert>
            )}

            {certificateType === "enhanced" && (
              <Alert className="bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800/30">
                <AlertDescription className="text-violet-700 dark:text-violet-400">
                  Enhanced certificates include all premium features plus legal verification and timestamp authority.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {!success ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate Certificate"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
