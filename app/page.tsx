'use client';

import { useEffect, useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { DashboardStats } from '@/components/dashboard-stats';
import { PersonList, type PersonBalance } from '@/components/person-list';
import { TransactionForm } from '@/components/transaction-form';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [totalBalance, setTotalBalance] = useState(0);
  const [balances, setBalances] = useState<PersonBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [totalRes, balancesRes] = await Promise.all([
        fetch('/api/balances?type=total'),
        fetch('/api/balances'),
      ]);

      if (!totalRes.ok || !balancesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const totalData = await totalRes.json();
      const balancesData = await balancesRes.json();

      setTotalBalance(totalData.total || 0);
      setBalances(Array.isArray(balancesData) ? balancesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Kunde inte hämta data. Försök igen senare.');
      setBalances([]);
      setTotalBalance(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Container - Mobile First */}
      <div className="max-w-md mx-auto px-4">
        {/* Header with Logo */}
        <div className="pt-8 pb-10 text-center">
          <div className="flex justify-center mb-8 animate-float">
            <Logo className="w-56 h-28 sm:w-64 sm:h-32" />
          </div>
          <div className="flex justify-center mb-8">
            <UserButton />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 glass-card border-red-500/30 p-4 rounded-2xl">
            <p className="text-sm font-medium text-red-400 text-center mb-2">
              {error}
            </p>
            <button
              onClick={fetchData}
              className="text-sm text-red-400 underline hover:no-underline font-medium block mx-auto"
            >
              Försök igen
            </button>
          </div>
        )}

        {/* Main Content Stack */}
        <div className="space-y-4">
          {/* Balance Widget */}
          <DashboardStats totalBalance={totalBalance} />

          {/* CTA Button */}
          <TransactionForm onSuccess={fetchData} />

          {/* Transactions List */}
          <PersonList balances={balances} />
        </div>
      </div>
    </div>
  );
}
