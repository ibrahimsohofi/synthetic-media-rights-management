import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { prisma } from './prisma';
import { hash, compare } from 'bcrypt';

// Configure authenticator
authenticator.options = {
  window: 1, // Allow 30 seconds before/after for clock drift
};

export interface TwoFactorSetupResponse {
  success: boolean;
  message: string;
  qrCodeUrl?: string;
  secret?: string;
  backupCodes?: string[];
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message: string;
}

/**
 * Generate a new 2FA secret and QR code for a user
 */
export async function setupTwoFactor(userId: string): Promise<TwoFactorSetupResponse> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Generate secret
    const secret = authenticator.generateSecret();
    
    // Generate QR code
    const otpauth = authenticator.keyuri(user.email, 'SyntheticRights', secret);
    const qrCodeUrl = await toDataURL(otpauth);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );

    // Hash backup codes
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => hash(code, 10))
    );

    // Store secret and hashed backup codes (but don't enable 2FA yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        backupCodes: JSON.stringify(hashedBackupCodes),
      },
    });

    return {
      success: true,
      message: "2FA setup initialized",
      qrCodeUrl,
      secret,
      backupCodes,
    };
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return { success: false, message: "Failed to setup 2FA" };
  }
}

/**
 * Verify a 2FA token and enable 2FA if it's the initial setup
 */
export async function verifyTwoFactor(
  userId: string,
  token: string,
  isInitialSetup = false
): Promise<TwoFactorVerifyResponse> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) {
      return { success: false, message: "2FA not set up" };
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return { success: false, message: "Invalid 2FA token" };
    }

    // If this is the initial setup, enable 2FA
    if (isInitialSetup) {
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });
    }

    return { success: true, message: "2FA verification successful" };
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return { success: false, message: "Failed to verify 2FA" };
  }
}

/**
 * Verify a backup code
 */
export async function verifyBackupCode(
  userId: string,
  backupCode: string
): Promise<TwoFactorVerifyResponse> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.backupCodes) {
      return { success: false, message: "No backup codes found" };
    }

    const hashedBackupCodes = JSON.parse(user.backupCodes) as string[];
    
    // Check if the provided code matches any of the hashed backup codes
    const matchPromises = hashedBackupCodes.map(hashedCode => 
      compare(backupCode, hashedCode)
    );
    const matches = await Promise.all(matchPromises);
    const matchIndex = matches.findIndex(match => match);

    if (matchIndex === -1) {
      return { success: false, message: "Invalid backup code" };
    }

    // Remove the used backup code
    hashedBackupCodes.splice(matchIndex, 1);
    await prisma.user.update({
      where: { id: userId },
      data: { backupCodes: JSON.stringify(hashedBackupCodes) },
    });

    return { success: true, message: "Backup code verification successful" };
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return { success: false, message: "Failed to verify backup code" };
  }
}

/**
 * Disable 2FA for a user
 */
export async function disableTwoFactor(userId: string): Promise<TwoFactorVerifyResponse> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null,
      },
    });

    return { success: true, message: "2FA disabled successfully" };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return { success: false, message: "Failed to disable 2FA" };
  }
} 