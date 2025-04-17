"use client";

import { useState } from "react";
import { AlertTriangle, ShieldOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CertificateRevokeDialogProps {
  certificateId: string;
  workTitle: string;
  children: React.ReactNode;
  onRevoked?: () => void;
}

export function CertificateRevokeDialog({
  certificateId,
  workTitle,
  children,
  onRevoked,
}: CertificateRevokeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revocationReason, setRevocationReason] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async () => {
    if (!confirmRevoke) {
      setError("You must confirm the revocation by checking the confirmation box");
      return;
    }

    if (!revocationReason.trim()) {
      setError("Please provide a reason for revoking this certificate");
      return;
    }

    setError(null);
    setIsRevoking(true);

    try {
      const response = await fetch(`/api/certificates/${certificateId}/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: revocationReason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke certificate");
      }

      toast.success("Certificate successfully revoked");

      // Close dialog and trigger callback
      setIsOpen(false);

      if (onRevoked) {
        onRevoked();
      }
    } catch (err) {
      console.error("Error revoking certificate:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error("Failed to revoke certificate");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setRevocationReason("");
      setConfirmRevoke(false);
      setError(null);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive gap-2">
            <ShieldOff className="h-5 w-5" />
            <span>Revoke Certificate</span>
          </DialogTitle>
          <DialogDescription>
            This will permanently revoke the certificate for <span className="font-medium">{workTitle}</span>.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="revocationReason">Reason for revocation</Label>
            <Textarea
              id="revocationReason"
              placeholder="Please provide a detailed reason for revoking this certificate"
              className="min-h-[100px]"
              value={revocationReason}
              onChange={(e) => setRevocationReason(e.target.value)}
              disabled={isRevoking}
            />
          </div>

          <Alert variant="warning" className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
              Revoking a certificate will invalidate any verification attempts. Public verification
              requests will show that this certificate has been revoked.
            </AlertDescription>
          </Alert>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="confirm-revoke"
              checked={confirmRevoke}
              onCheckedChange={(checked) => setConfirmRevoke(checked === true)}
              disabled={isRevoking}
            />
            <Label
              htmlFor="confirm-revoke"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand that revoking this certificate is permanent and cannot be undone
            </Label>
          </div>
        </div>

        <DialogFooter className="flex space-x-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={isRevoking}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={isRevoking || !confirmRevoke}
            className="gap-2"
          >
            {isRevoking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Revoking...
              </>
            ) : (
              <>
                <ShieldOff className="h-4 w-4" />
                Revoke Certificate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
