import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from 'otplib';
import { randomBytes, createHash } from 'crypto';

function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(code.match(/.{4}/g)!.join('-'));
  }
  return codes;
}

function hashBackupCodes(codes: string[]): string[] {
  return codes.map(code => 
    createHash('sha256')
      .update(code.replace(/-/g, ''))
      .digest('hex')
  );
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if 2FA is already enabled
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true },
    });

    if (user?.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already enabled" },
        { status: 400 }
      );
    }

    // Generate secret
    const secret = authenticator.generateSecret();
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = hashBackupCodes(backupCodes);

    // Save secret and hashed backup codes
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret,
        backupCodes: JSON.stringify(hashedBackupCodes),
      },
    });

    // Generate QR code URL
    const appName = 'SyntheticRights';
    const accountName = session.user.email;
    const otpAuthUrl = authenticator.keyuri(accountName!, appName, secret);

    return NextResponse.json({
      qrCodeUrl: otpAuthUrl,
      backupCodes,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 