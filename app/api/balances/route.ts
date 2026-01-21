import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getPersonBalances, getTotalBalance } from '@/lib/db';

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'total') {
      const totalBalance = await getTotalBalance(userId);
      return NextResponse.json({ total: totalBalance });
    }

    const balances = await getPersonBalances(userId);
    return NextResponse.json(balances || []);
  } catch (error) {
    console.error('Error fetching balances:', error);
    // Returnera tom array vid fel för att undvika .map crashes
    return NextResponse.json([], { status: 500 });
  }
}
