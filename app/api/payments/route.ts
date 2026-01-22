import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createPayment, getPaymentsByTransaction } from '@/lib/db';

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing transaction ID' },
        { status: 400 }
      );
    }

    const payments = await getPaymentsByTransaction(parseInt(transactionId));

    // Convert DECIMAL amounts to numbers
    const normalizedPayments = payments.map(p => ({
      ...p,
      amount: parseFloat(p.amount as any),
    }));

    return NextResponse.json(normalizedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { transactionId, amount, paymentDate } = body;

    if (!transactionId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payment = await createPayment(
      parseInt(transactionId),
      parseFloat(amount),
      paymentDate ? new Date(paymentDate) : undefined
    );

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
