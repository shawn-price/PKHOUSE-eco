import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { getContactsByUser, getContactsByType, createContact } from '@/lib/db/queries';
import { ContactCreateSchema } from '@/lib/validation/schemas';

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
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let contacts;

    if (type) {
      contacts = await getContactsByType(userId, type, limit, offset);
    } else {
      contacts = await getContactsByUser(userId, limit, offset);
    }

    return NextResponse.json({
      success: true,
      data: contacts,
      count: contacts.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contacts' },
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
    const validatedData = ContactCreateSchema.parse(body);

    const contact = await createContact({
      user_id: parseInt((session.user as any).id),
      ...validatedData,
    });

    return NextResponse.json(
      {
        success: true,
        data: contact,
        message: 'Contact created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create contact' },
      { status: 400 }
    );
  }
}
