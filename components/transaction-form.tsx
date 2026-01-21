'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface TransactionFormProps {
  onSuccess: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    type: 'lent_out' as 'lent_out' | 'borrowed',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      setFormData({
        personName: '',
        amount: '',
        type: 'lent_out',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        dueDate: '',
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Något gick fel. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full cta-button rounded-2xl py-5 px-6 font-bold text-lg text-white flex items-center justify-center gap-3 active:scale-[0.98] transition-transform">
          <div className="bg-white/20 rounded-full p-2">
            <Plus className="w-6 h-6" />
          </div>
          <span>Ny Transaktion</span>
        </button>
      </DialogTrigger>

      <DialogContent className="glass-card border-white/10 max-w-md mx-4">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Lägg till transaktion
            </DialogTitle>
            <DialogDescription className="text-center text-white/60">
              Registrera ett nytt lån eller en utlägg
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="personName" className="text-white/80 font-medium text-sm">
                Namn
              </Label>
              <Input
                id="personName"
                placeholder="t.ex. Anna"
                value={formData.personName}
                onChange={(e) =>
                  setFormData({ ...formData, personName: e.target.value })
                }
                className="h-12 text-base"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-white/80 font-medium text-sm">
                Belopp (SEK)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="h-12 text-base"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type" className="text-white/80 font-medium text-sm">
                Typ
              </Label>
              <select
                id="type"
                className="flex h-12 w-full rounded-xl border border-white/10 bg-secondary/30 px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all text-white"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'lent_out' | 'borrowed',
                  })
                }
              >
                <option value="lent_out">Jag lånade ut</option>
                <option value="borrowed">Jag lånade</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-white/80 font-medium text-sm">
                Beskrivning (frivillig)
              </Label>
              <Input
                id="description"
                placeholder="t.ex. Middag"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="h-12 text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="transactionDate" className="text-white/80 font-medium text-sm">
                  Datum
                </Label>
                <Input
                  id="transactionDate"
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionDate: e.target.value,
                    })
                  }
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate" className="text-white/80 font-medium text-sm">
                  Förfallo
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 cta-button font-bold text-base"
            >
              {loading ? 'Sparar...' : 'Spara'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
