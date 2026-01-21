'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';

export interface PersonBalance {
  person_name: string;
  balance: number;
  transaction_count: number;
}

interface PersonListProps {
  balances: PersonBalance[];
}

export function PersonList({ balances }: PersonListProps) {
  if (balances.length === 0) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="py-12 text-center">
          <div className="mb-4 inline-flex p-4 bg-purple-500/10 rounded-2xl">
            <Users className="h-10 w-10 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white/90">
            Inga transaktioner ännu
          </h3>
          <p className="text-sm text-white/50">
            Tryck på knappen ovan för att komma igång
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-base font-bold text-white/70 uppercase tracking-wider">
          Personer
        </h2>
        <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-400 font-medium">
          {balances.length}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {balances.map((person) => {
          const isPositive = person.balance >= 0;
          const absBalance = Math.abs(person.balance);

          return (
            <Link
              key={person.person_name}
              href={`/person/${encodeURIComponent(person.person_name)}`}
            >
              <Card className="glass-card glass-card-hover border-white/10 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: Icon + Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          isPositive
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-6 h-6" />
                        ) : (
                          <ArrowDownRight className="w-6 h-6" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white/90 truncate mb-0.5">
                          {person.person_name}
                        </p>
                        <p className="text-xs text-white/40">
                          {person.transaction_count}{' '}
                          {person.transaction_count === 1
                            ? 'transaktion'
                            : 'transaktioner'}
                        </p>
                      </div>
                    </div>

                    {/* Right: Amount + Arrow */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${
                            isPositive ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {isPositive ? '+' : '-'}
                          {absBalance.toLocaleString('sv-SE', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}
                        </div>
                        <div className="text-xs text-white/30 font-medium">
                          SEK
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-white/5">
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
