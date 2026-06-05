import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { markMessageAsRead } from '@/lib/db/queries';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const messageId = parseInt(params.id, 10);
    await markMessageAsRead(messageId);

    return NextResponse.json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to mark message as read' },
      { status: 500 }
    );
  }
}
