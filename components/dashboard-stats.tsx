'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStatsProps {
  totalBalance: number;
}

export function DashboardStats({ totalBalance }: DashboardStatsProps) {
  const isPositive = totalBalance >= 0;
  const absBalance = Math.abs(totalBalance);

  return (
    <Card className="balance-card border-0 overflow-hidden">
      <CardContent className="p-6 sm:p-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
          <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
            Total Balans
          </span>
        </div>

        {/* Amount */}
        <div className="mb-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            {isPositive ? (
              <ArrowUpRight className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
            ) : (
              <ArrowDownRight className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
            )}
            <div
              className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tight ${
                isPositive
                  ? 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500'
                  : 'bg-gradient-to-br from-red-400 via-rose-400 to-orange-500'
              } bg-clip-text text-transparent`}
            >
              {isPositive ? '+' : '-'}
              {absBalance.toLocaleString('sv-SE', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white/40 tracking-wide">
            SEK
          </div>
        </div>

        {/* Description */}
        <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
          <div
            className={`px-4 py-2 rounded-full ${
              isPositive
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            <span className="font-semibold">
              {isPositive ? 'Andra är skyldiga dig' : 'Du är skyldig andra'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
