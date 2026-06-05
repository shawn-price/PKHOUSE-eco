import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
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
    // Fetch statistics from the database
    const [usersResult, propertiesResult, dealsResult, messagesResult, contactsResult] =
      await Promise.all([
        query('SELECT COUNT(*) as count FROM users'),
        query('SELECT COUNT(*) as count FROM properties'),
        query('SELECT COUNT(*) as count FROM deals'),
        query('SELECT COUNT(*) as count FROM messages'),
        query('SELECT COUNT(*) as count FROM contacts'),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: parseInt(usersResult.rows[0].count, 10),
        totalProperties: parseInt(propertiesResult.rows[0].count, 10),
        totalDeals: parseInt(dealsResult.rows[0].count, 10),
        totalMessages: parseInt(messagesResult.rows[0].count, 10),
        totalContacts: parseInt(contactsResult.rows[0].count, 10),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
