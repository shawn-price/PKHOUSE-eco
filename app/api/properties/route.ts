import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { createProperty, getPropertiesByCity, getPropertiesByType } from '@/lib/db/queries';
import { PropertyCreateSchema } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let properties;
    
    if (city) {
      properties = await getPropertiesByCity(city, limit, offset);
    } else if (type) {
      properties = await getPropertiesByType(type, limit, offset);
    } else {
      const { query } = require('@/lib/db/index');
      const result = await query(
        'SELECT * FROM properties ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      properties = result.rows;
    }

    return NextResponse.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch properties' },
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
    
    // Validate input
    const validatedData = PropertyCreateSchema.parse(body);

    const property = await createProperty({
      ...validatedData,
      agent_id: parseInt((session.user as any).id),
    });

    return NextResponse.json(
      {
        success: true,
        data: property,
        message: 'Property created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create property' },
      { status: 400 }
    );
  }
}
