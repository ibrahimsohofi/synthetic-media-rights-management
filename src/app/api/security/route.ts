import { NextResponse } from 'next/server';
import { EnhancedMonitoringService } from '@/lib/monitoring/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const monitoringService = EnhancedMonitoringService.getInstance();
    const events = await monitoringService.getRecentSecurityEvents(100); // Last 100 security events

    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch security events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security events' },
      { status: 500 }
    );
  }
} 