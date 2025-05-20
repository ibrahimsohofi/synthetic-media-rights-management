import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestPasswordReset } from "@/lib/actions/auth";
import { resetPasswordRequestSchema } from "@/lib/schemas/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordRequestSchema.parse(body);

    // Request password reset
    const result = await requestPasswordReset(validatedData.email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 