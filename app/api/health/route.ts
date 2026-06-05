import { NextResponse } from 'next/server';
import { query } from '@/lib/db/index';

export async function GET() {
  try {
    // Test database connection
    await query('SELECT 1');
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[v0] Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
