'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

interface TwoFactorSettingsProps {
  userId: string;
  twoFactorEnabled: boolean;
}

export function TwoFactorSettings({ userId, twoFactorEnabled }: TwoFactorSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(twoFactorEnabled);
  const [isEnabling, setIsEnabling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEnable2FA = async () => {
    try {
      setIsEnabling(true);
      setError(null);

      const response = await fetch('/api/user/2fa/setup', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to setup 2FA');
      }

      const { qrCodeUrl, backupCodes } = await response.json();
      setQrCode(qrCodeUrl);
      setBackupCodes(backupCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setIsEnabling(true);
      setError(null);

      const response = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify 2FA');
      }

      setIsEnabled(true);
      setQrCode(null);
      setBackupCodes([]);
      setSuccess('Two-factor authentication has been enabled successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setIsEnabling(true);
      setError(null);

      const response = await fetch('/api/user/2fa/disable', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable 2FA');
      }

      setIsEnabled(false);
      setSuccess('Two-factor authentication has been disabled successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!isEnabled && !qrCode && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication adds an extra layer of security to your account.
              When enabled, you'll need to enter a code from your authenticator app
              in addition to your password when signing in.
            </p>
            <Button onClick={handleEnable2FA} disabled={isEnabling}>
              {isEnabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}

        {qrCode && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">1. Scan this QR code with your authenticator app</p>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <QRCodeSVG value={qrCode} size={200} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">2. Enter the verification code from your app</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                <Button onClick={handleVerify2FA} disabled={isEnabling || verificationCode.length !== 6}>
                  {isEnabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </div>
            </div>

            {backupCodes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">3. Save these backup codes</p>
                <p className="text-sm text-muted-foreground">
                  If you lose access to your authenticator app, you can use these codes to sign in.
                  Keep them in a safe place.
                </p>
                <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-sm">{code}</code>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isEnabled && !qrCode && (
          <div className="space-y-4">
            <p className="text-sm text-green-600 font-medium">
              ✓ Two-factor authentication is enabled
            </p>
            <Button variant="destructive" onClick={handleDisable2FA} disabled={isEnabling}>
              {isEnabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disable Two-Factor Authentication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 