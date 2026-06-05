import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { getMessagesBetweenUsers, getUnreadMessageCount, createMessage } from '@/lib/db/queries';
import { MessageCreateSchema } from '@/lib/validation/schemas';
import { query } from '@/lib/db/index';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const userId = parseInt((session.user as any).id);
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get('with');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!otherUserId) {
      // Fetch all conversations
      const result = await query(
        `SELECT DISTINCT 
           CASE 
             WHEN sender_id = $1 THEN receiver_id 
             ELSE sender_id 
           END as user_id,
           MAX(created_at) as last_message_at
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
         GROUP BY user_id
         ORDER BY last_message_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return NextResponse.json({
        success: true,
        data: result.rows,
      });
    }

    const otherUserIdInt = parseInt(otherUserId, 10);
    const messages = await getMessagesBetweenUsers(userId, otherUserIdInt, limit, offset);

    // Get unread count
    const unreadCount = await getUnreadMessageCount(userId);

    return NextResponse.json({
      success: true,
      data: messages,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validatedData = MessageCreateSchema.parse(body);

    const message = await createMessage({
      sender_id: parseInt((session.user as any).id),
      ...validatedData,
    });

    return NextResponse.json(
      {
        success: true,
        data: message,
        message: 'Message sent successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 400 }
    );
  }
}
