import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { InputField, TextareaField } from '../../components/ui/FormField';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useHotelData } from '../../hooks/useRepository';
import { useToast } from '../../hooks/useToast';
import type { PromoOffer } from '../../types/hotel';

export function AdminRatesPage() {
  useDocumentMeta('Rates & Promo Offers · Hotel Ramniwas Admin', 'Manage seasonal rates, weekend pricing, and discount codes.');

  const { state, repo } = useHotelData();
  const { showToast } = useToast();

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [description, setDescription] = useState('');

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      showToast({ tone: 'error', title: 'Provide offer code and title' });
      return;
    }
    const promo: PromoOffer = {
      id: `promo-${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim() || 'Direct booking promotional tariff.',
      discountPercent: Math.min(50, Math.max(1, Number(discountPercent) || 10)),
      weekendMultiplier: 1.05,
      seasonalMultiplier: 1,
      active: true,
    };
    repo.savePromo(promo);
    setCode('');
    setTitle('');
    setDescription('');
    showToast({ tone: 'success', title: `Offer ${promo.code} created` });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
          Rates, Seasonal Rules & Promo Offers
        </h1>
        <p className="text-sm text-text-secondary">
          Weekend stays (Friday/Saturday) automatically apply a +5% peak demand factor; active promo codes apply immediately in the booking wizard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          {state.promos.map((promo) => (
            <div
              key={promo.id}
              className="p-5 rounded-xl bg-surface-raised border border-border-subtle shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-action-primary">{promo.code}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums font-semibold">{promo.discountPercent}% OFF</span>
                  <span aria-hidden="true">·</span>
                  <span className={promo.active ? 'text-status-success font-semibold' : 'text-text-secondary'}>
                    {promo.active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <h2 className="font-display text-lg font-semibold text-text-primary mt-1">
                  {promo.title}
                </h2>
                <p className="text-xs text-text-secondary mt-1">{promo.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => repo.savePromo({ ...promo, active: !promo.active })}
                >
                  {promo.active ? 'Pause' : 'Activate'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete offer ${promo.code}`}
                  onClick={() => repo.deletePromo(promo.id)}
                >
                  <Trash2 className="w-4 h-4 text-status-error" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleAddPromo}
          className="lg:col-span-5 p-6 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-4"
        >
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Create Direct Booking Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Promo Code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="FESTIVE12"
            />
            <InputField
              label="Discount (%)"
              type="number"
              required
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />
          </div>
          <InputField
            label="Offer Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekend Rail Traveller Offer"
          />
          <TextareaField
            label="Offer Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Save Offer Code
          </Button>
        </form>
      </div>
    </div>
  );
}
