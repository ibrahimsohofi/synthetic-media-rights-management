import { NextResponse } from 'next/server';
import { EnhancedMonitoringService } from '@/lib/monitoring/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const monitoringService = EnhancedMonitoringService.getInstance();
    const metrics = await monitoringService.getRecentMetrics(1000); // Last 1000 metrics

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 