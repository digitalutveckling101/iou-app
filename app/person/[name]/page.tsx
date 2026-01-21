'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, Loader2, Trash2, Wallet } from 'lucide-react';

interface Transaction {
  id: number;
  person_name: string;
  amount: number;
  type: 'lent_out' | 'borrowed';
  description?: string;
  transaction_date: string;
  due_date?: string;
}

interface Payment {
  id: number;
  transaction_id: number;
  amount: number;
  payment_date: string;
}

export default function PersonPage() {
  const params = useParams();
  const router = useRouter();
  const personName = decodeURIComponent(params.name as string);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<{ [key: number]: Payment[] }>({});
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch(
        `/api/transactions?person=${encodeURIComponent(personName)}`
      );
      const data = await res.json();
      setTransactions(data);

      // Fetch payments for each transaction
      const paymentsData: { [key: number]: Payment[] } = {};
      for (const transaction of data) {
        const paymentRes = await fetch(
          `/api/payments?transactionId=${transaction.id}`
        );
        const paymentData = await paymentRes.json();
        paymentsData[transaction.id] = paymentData;
      }
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [personName]);

  const getTotalPaid = (transactionId: number) => {
    const transactionPayments = payments[transactionId] || [];
    return transactionPayments.reduce((sum, p) => sum + p.amount, 0);
  };

  const getRemainingAmount = (transaction: Transaction) => {
    const totalPaid = getTotalPaid(transaction.id);
    return transaction.amount - totalPaid;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: selectedTransaction.id,
          amount: parseFloat(paymentAmount),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      setPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedTransaction(null);
      fetchData();
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Något gick fel. Försök igen.');
    }
  };

  const handleDelete = async (transactionId: number) => {
    if (!confirm('Är du säker på att du vill radera denna transaktion?'))
      return;

    try {
      const response = await fetch(
        `/api/transactions?id=${transactionId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Något gick fel. Försök igen.');
    }
  };

  const totalBalance = transactions.reduce((sum, t) => {
    const remaining = getRemainingAmount(t);
    return sum + (t.type === 'lent_out' ? remaining : -remaining);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{personName}</h1>
        </div>

        <Card
          className={
            totalBalance >= 0 ? 'border-green-500' : 'border-red-500'
          }
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balans med {personName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalBalance >= 0 ? '+' : ''}
              {totalBalance.toFixed(2)} SEK
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalBalance >= 0
                ? `${personName} är skyldig dig`
                : `Du är skyldig ${personName}`}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Transaktioner</h2>
          {transactions.map((transaction) => {
            const remaining = getRemainingAmount(transaction);
            const isPaid = remaining === 0;
            const isLentOut = transaction.type === 'lent_out';

            return (
              <Card
                key={transaction.id}
                className={isPaid ? 'opacity-60' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-sm font-medium px-2 py-0.5 rounded ${
                            isLentOut
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isLentOut ? 'Lånat ut' : 'Lånat'}
                        </span>
                        {isPaid && (
                          <span className="text-sm font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            Betald
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold">
                        {transaction.amount.toFixed(2)} SEK
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {transaction.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(
                            transaction.transaction_date
                          ).toLocaleDateString('sv-SE')}
                        </div>
                        {transaction.due_date && (
                          <div className="flex items-center gap-1">
                            Förfaller:{' '}
                            {new Date(transaction.due_date).toLocaleDateString(
                              'sv-SE'
                            )}
                          </div>
                        )}
                      </div>
                      {!isPaid && (
                        <p className="text-sm font-medium mt-2">
                          Kvar: {remaining.toFixed(2)} SEK
                        </p>
                      )}
                      {payments[transaction.id]?.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs font-medium mb-1">
                            Betalningar:
                          </p>
                          {payments[transaction.id].map((payment) => (
                            <p
                              key={payment.id}
                              className="text-xs text-muted-foreground"
                            >
                              {payment.amount.toFixed(2)} SEK -{' '}
                              {new Date(payment.payment_date).toLocaleDateString(
                                'sv-SE'
                              )}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!isPaid && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setPaymentDialogOpen(true);
                          }}
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {transactions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Inga transaktioner med {personName}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <form onSubmit={handlePayment}>
            <DialogHeader>
              <DialogTitle>Registrera betalning</DialogTitle>
              <DialogDescription>
                {selectedTransaction &&
                  `Kvar att betala: ${getRemainingAmount(
                    selectedTransaction
                  ).toFixed(2)} SEK`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="paymentAmount">Belopp (SEK)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={
                    selectedTransaction
                      ? getRemainingAmount(selectedTransaction)
                      : undefined
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Spara betalning</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
