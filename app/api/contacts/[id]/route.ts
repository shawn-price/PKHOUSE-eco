import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { updateContact, deleteContact } from '@/lib/db/queries';
import { query } from '@/lib/db/index';

export async function GET(
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
    const contactId = parseInt(params.id, 10);
    const userId = parseInt((session.user as any).id);

    const result = await query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [contactId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const contactId = parseInt(params.id, 10);
    const userId = parseInt((session.user as any).id);

    // Verify ownership
    const checkResult = await query(
      'SELECT user_id FROM contacts WHERE id = $1',
      [contactId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    if (checkResult.rows[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatedContact = await updateContact(contactId, body);

    return NextResponse.json({
      success: true,
      data: updatedContact,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update contact' },
      { status: 400 }
    );
  }
}

export async function DELETE(
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
    const contactId = parseInt(params.id, 10);
    const userId = parseInt((session.user as any).id);

    // Verify ownership
    const checkResult = await query(
      'SELECT user_id FROM contacts WHERE id = $1',
      [contactId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    if (checkResult.rows[0].user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await deleteContact(contactId);

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
