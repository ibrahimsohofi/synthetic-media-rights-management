import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { monitoring } from "@/lib/monitoring";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow administrators to access monitoring data
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') as 'hour' | 'day' | 'week' || 'day';

    const metrics = await monitoring.getAPIMetrics(timeframe);
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Monitoring metrics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 