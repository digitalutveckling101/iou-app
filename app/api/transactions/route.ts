import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getTransactionsByPerson,
} from '@/lib/db';

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const personName = searchParams.get('person');

    let transactions;
    if (personName) {
      transactions = await getTransactionsByPerson(userId, personName);
    } else {
      transactions = await getTransactions(userId);
    }

    // Convert DECIMAL amounts to numbers
    const normalizedTransactions = transactions.map(t => ({
      ...t,
      amount: parseFloat(t.amount as any),
    }));

    return NextResponse.json(normalizedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
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
    const { personName, amount, type, description, transactionDate, dueDate } =
      body;

    if (!personName || !amount || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transaction = await createTransaction(
      userId,
      personName,
      parseFloat(amount),
      type,
      description,
      transactionDate ? new Date(transactionDate) : undefined,
      dueDate ? new Date(dueDate) : undefined
    );

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing transaction id' },
        { status: 400 }
      );
    }

    await deleteTransaction(parseInt(id), userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
