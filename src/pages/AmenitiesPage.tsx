import React, { useState } from 'react';
import { Briefcase, Car, Clock, Luggage, Minus, Plus, Shirt, UtensilsCrossed } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField, TextareaField } from '../components/ui/FormField';
import { SmartImage } from '../components/ui/SmartImage';
import { DINING_MENU } from '../data/seed';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useHotelData } from '../hooks/useRepository';
import { useToast } from '../hooks/useToast';
import { formatInr, isValidIndianMobile } from '../utils/validators';

export function AmenitiesPage() {
  useDocumentMeta(
    'Pure Veg Dining & Hotel Amenities · Hotel Ramniwas, Jalgaon',
    'Vegetarian restaurant (breakfast, lunch, high tea, dinner), 24-hour room service, parking with EV plug, laundry, luggage storage, and travel desk.'
  );

  const { state, repo } = useHotelData();
  const { showToast } = useToast();

  const [cart, setCart] = useState<Record<string, number>>({});
  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const selectedItems = DINING_MENU.filter((m) => (cart[m.id] ?? 0) > 0).map((m) => ({
    name: m.name,
    qty: cart[m.id],
    price: m.price,
  }));
  const orderTotal = selectedItems.reduce((sum, i) => sum + i.qty * i.price, 0);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErr: Record<string, string> = {};
    if (selectedItems.length === 0) nextErr.items = 'Add at least one dish from the menu above.';
    if (guestName.trim().length < 2) nextErr.guestName = 'Enter guest name.';
    if (!roomNumber.trim()) nextErr.roomNumber = 'Enter your room number (e.g. 305).';
    if (!isValidIndianMobile(phone)) nextErr.phone = 'Enter valid 10-digit mobile number.';
    setErrors(nextErr);
    if (Object.keys(nextErr).length > 0) return;

    repo.submitEnquiry({
      type: 'Room Service',
      guestName: guestName.trim(),
      phone: phone.trim(),
      roomNumber: roomNumber.trim(),
      subject: `In-Room Dining Order · Room ${roomNumber.trim()}`,
      message: notes.trim() || 'Standard preparation',
      items: selectedItems,
      totalAmount: orderTotal,
    });

    setCart({});
    setNotes('');
    showToast({
      tone: 'success',
      title: `Order sent to kitchen for Room ${roomNumber.trim()}`,
      description: `Estimated delivery 20–25 minutes. Total: ${formatInr(orderTotal)}`,
    });
  };

  const facilitySections = [
    {
      icon: UtensilsCrossed,
      title: 'Pure Vegetarian Dining · Breakfast, Lunch, High Tea & Dinner',
      slot: 'restaurant-1' as const,
      copy: state.siteContent.diningHighlight,
      bullets: ['Early-morning tea & poha from 6:30 AM', 'Jain & low-spice meal options on request', 'Wholesome Khandeshi & North Indian thalis'],
    },
    {
      icon: Clock,
      title: '24-Hour Room Service & Business Essentials',
      slot: 'lobby-1' as const,
      copy: 'Whether you arrive on a midnight express or prepare for morning client meetings in Jalgaon, our front desk and kitchen operate round the clock.',
      bullets: ['High-speed Wi-Fi across all 4 floors', 'In-room work desk & landline intercom', 'Instant GST billing & print support at reception'],
    },
    {
      icon: Car,
      title: 'Parking with EV Plug, Travel Desk & Car Hire',
      slot: 'exterior-1' as const,
      copy: 'Dedicated on-site vehicle parking with EV charging socket access, plus vetted local cabs for Jalgaon Airport (9 km) and full-day Ajanta Caves excursions.',
      bullets: ['On-site parking & EV charging plug', 'Same-day laundry & pressing service', 'Complimentary luggage storage before/after checkout'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-14 space-y-12 sm:space-y-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
          Hospitality & Dining Since 1975
        </p>
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-text-primary mt-1.5">
          Vegetarian Dining & Guest Amenities
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mt-2 leading-relaxed">
          From fresh breakfast trays before an early train to EV charging and Ajanta travel arrangements—everything designed around practical comfort.
        </p>
      </div>

      {/* Split-screen editorial sections */}
      <div className="space-y-8 sm:space-y-12">
        {facilitySections.map((sec, idx) => {
          const Icon = sec.icon;
          const reverse = idx % 2 === 1;
          return (
            <section
              key={sec.title}
              className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-stretch rounded-2xl bg-surface-raised border border-border-subtle shadow-card overflow-hidden"
            >
              <div className={`lg:col-span-6 min-h-[220px] sm:min-h-[280px] ${reverse ? 'lg:order-2' : ''}`}>
                <SmartImage slot={sec.slot} fallbackTitle={sec.title} className="w-full h-full" />
              </div>
              <div className={`lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center ${reverse ? 'lg:order-1' : ''}`}>
                <div className="w-10 h-10 rounded-lg bg-surface-base border border-border-subtle flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-action-primary" aria-hidden="true" />
                </div>
                <h2 className="font-display text-2xl font-bold text-text-primary">{sec.title}</h2>
                <p className="text-sm text-text-secondary mt-3 leading-relaxed">{sec.copy}</p>
                <ul className="mt-5 space-y-2 text-sm text-text-primary">
                  {sec.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-action-accent" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      {/* Quick Amenities Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-surface-raised border border-border-subtle">
          <Shirt className="w-5 h-5 text-action-primary mb-2" aria-hidden="true" />
          <h3 className="font-display text-lg font-semibold">Express Laundry</h3>
          <p className="text-sm text-text-secondary mt-1">Same-day wash and steam press available through housekeeping.</p>
        </div>
        <div className="p-5 rounded-xl bg-surface-raised border border-border-subtle">
          <Luggage className="w-5 h-5 text-action-primary mb-2" aria-hidden="true" />
          <h3 className="font-display text-lg font-semibold">Complimentary Cloakroom</h3>
          <p className="text-sm text-text-secondary mt-1">Store bags safely after 11:00 AM checkout until your evening train.</p>
        </div>
        <div className="p-5 rounded-xl bg-surface-raised border border-border-subtle">
          <Briefcase className="w-5 h-5 text-action-primary mb-2" aria-hidden="true" />
          <h3 className="font-display text-lg font-semibold">Corporate GST Billing</h3>
          <p className="text-sm text-text-secondary mt-1">Instant GST invoices for business travellers and corporate accounts.</p>
        </div>
      </section>

      {/* In-Room Dining Menu & Order to Room Form */}
      <section id="room-service" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
              100% Pure Vegetarian Kitchen
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-primary mt-1">
              In-Room Dining Menu
            </h2>
          </div>

          <div className="divide-y divide-border-subtle rounded-2xl bg-surface-raised border border-border-subtle shadow-card overflow-hidden">
            {DINING_MENU.map((item) => {
              const qty = cart[item.id] ?? 0;
              return (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                      <span>{item.category}</span>
                      {item.isJainAvailable && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-status-success font-medium">Jain option available</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-semibold text-text-primary mt-0.5">{item.name}</h3>
                    <p className="text-xs text-text-secondary mt-1">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle/50">
                    <span className="font-ui font-semibold text-text-primary tabular-nums">
                      {formatInr(item.price)}
                    </span>
                    <div className="inline-flex items-center gap-1 rounded-lg border border-border-subtle p-1 bg-surface-base">
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-muted cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                      <button
                        type="button"
                        aria-label={`Add ${item.name}`}
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-muted cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleOrderSubmit}
          noValidate
          className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-surface-raised border border-border-subtle shadow-card space-y-4 lg:sticky lg:top-24"
        >
          <h3 className="font-display text-xl font-semibold text-text-primary">
            Order to Room
          </h3>
          <p className="text-xs text-text-secondary">
            Orders route directly to our kitchen & front desk inbox. Pay via room bill or UPI.
          </p>

          {errors.items && (
            <p className="text-xs text-status-error" role="alert">
              {errors.items}
            </p>
          )}

          {selectedItems.length > 0 && (
            <div className="p-3 rounded-lg bg-surface-base border border-border-subtle text-xs space-y-1">
              {selectedItems.map((i) => (
                <div key={i.name} className="flex justify-between">
                  <span>{i.qty}× {i.name}</span>
                  <span className="font-semibold tabular-nums">{formatInr(i.qty * i.price)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border-subtle flex justify-between font-bold text-sm text-text-primary">
                <span>Order Total</span>
                <span className="tabular-nums">{formatInr(orderTotal)}</span>
              </div>
            </div>
          )}

          <InputField
            label="Guest Name"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            error={errors.guestName}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Room No."
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 305"
              error={errors.roomNumber}
            />
            <InputField
              label="Mobile"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9823011223"
              error={errors.phone}
            />
          </div>
          <TextareaField
            label="Kitchen Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Jain preparation, extra hot chai..."
          />

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Send Order to Room
          </Button>
        </form>
      </section>
    </div>
  );
}
