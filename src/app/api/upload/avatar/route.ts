import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = 'public/uploads/avatars';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG and WebP images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    await writeFile(UPLOAD_DIR, '', { flag: 'a' });

    // Generate unique filename
    const filename = `${session.user.id}-${Date.now()}.webp`;
    const filepath = join(UPLOAD_DIR, filename);

    // Process and save image
    const buffer = Buffer.from(await file.arrayBuffer());
    await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    const url = `/uploads/avatars/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 