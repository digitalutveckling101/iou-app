import { NextResponse } from 'next/server';
import { createTables } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Simple security: require a secret token
    const { secret } = await request.json();

    if (secret !== process.env.DB_INIT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await createTables();

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully'
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
