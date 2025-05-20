import { NextResponse } from 'next/server';
import { EnhancedMonitoringService } from '@/lib/monitoring/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const monitoringService = EnhancedMonitoringService.getInstance();
    const errors = await monitoringService.getRecentErrors(100); // Last 100 errors

    return NextResponse.json(errors);
  } catch (error) {
    console.error('Failed to fetch errors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch errors' },
      { status: 500 }
    );
  }
} 