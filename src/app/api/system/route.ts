import { NextResponse } from 'next/server';
import { EnhancedMonitoringService } from '@/lib/monitoring/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const monitoringService = EnhancedMonitoringService.getInstance();
    const metrics = await monitoringService.getRecentSystemMetrics(100); // Last 100 system metrics

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch system metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
} 