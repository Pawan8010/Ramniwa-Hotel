import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Download,
  Mail,
  MessageCircle,
  Plus,
  Printer,
  Search,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/DataState';
import { InputField, SelectField } from '../../components/ui/FormField';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import {
  buildMailtoConfirmationUrl,
  buildWhatsAppConfirmationUrl,
  exportBookingsToCsv,
} from '../../data/repo';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useHotelData } from '../../hooks/useRepository';
import { useToast } from '../../hooks/useToast';
import type { Booking, BookingStatus, PaymentMode } from '../../types/hotel';
import {
  formatDisplayDate,
  formatInr,
  getRelativeIsoDate,
  isValidEmail,
  isValidIndianMobile,
} from '../../utils/validators';

type FilterTab = 'All' | BookingStatus;

export function AdminBookingsPage() {
  useDocumentMeta('Bookings Management · Hotel Ramniwas Admin', 'Search, filter, check in, check out, print GST invoices, and add walk-ins.');

  const { state, repo } = useHotelData();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState<FilterTab>('All');
  const [sortField, setSortField] = useState<'checkIn' | 'totalAmount'>('checkIn');
  const [sortAsc, setSortAsc] = useState(false);

  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);

  // Walk-in form state
  const [wRoomId, setWRoomId] = useState(state.roomTypes[0]?.id ?? 'rt-ac-king');
  const [wCheckIn, setWCheckIn] = useState(() => getRelativeIsoDate(0));
  const [wCheckOut, setWCheckOut] = useState(() => getRelativeIsoDate(1));
  const [wName, setWName] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wEmail, setWEmail] = useState('');
  const [wPayMode, setWPayMode] = useState<PaymentMode>('Cash');

  const roomMap = useMemo(
    () => new Map(state.roomTypes.map((r) => [r.id, r.name])),
    [state.roomTypes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.bookings
      .filter((b) => (statusTab === 'All' ? true : b.status === statusTab))
      .filter((b) =>
        q
          ? b.id.toLowerCase().includes(q) ||
            b.guestName.toLowerCase().includes(q) ||
            b.guestPhone.includes(q)
          : true
      )
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [state.bookings, statusTab, query, sortField, sortAsc]);

  const handleStatusChange = (booking: Booking, nextStatus: BookingStatus) => {
    repo.updateBookingStatus(booking.id, nextStatus);
    showToast({
      tone: 'success',
      title: `${booking.id} → ${nextStatus}`,
      description:
        nextStatus === 'Checked-out'
          ? `Room ${booking.roomNumber ?? ''} released and Cleaning task created automatically.`
          : 'Booking status updated.',
    });
  };

  const handleExportCsv = () => {
    const csv = exportBookingsToCsv(filtered, state.roomTypes);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-ramniwas-bookings-${getRelativeIsoDate(0)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({ tone: 'info', title: 'CSV exported', description: `${filtered.length} bookings downloaded.` });
  };

  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (wName.trim().length < 2 || !isValidIndianMobile(wPhone)) {
      showToast({ tone: 'error', title: 'Invalid guest info', description: 'Provide full name and 10-digit Indian mobile.' });
      return;
    }
    const res = repo.createBooking({
      roomTypeId: wRoomId,
      checkIn: wCheckIn,
      checkOut: wCheckOut,
      guests: 2,
      guestName: wName.trim(),
      guestPhone: wPhone.trim(),
      guestEmail: isValidEmail(wEmail) ? wEmail.trim() : 'walkin@hotelramniwas.in',
      idType: 'Aadhaar',
      specialRequests: 'Walk-in desk registration',
      paymentMode: wPayMode,
      source: 'Walk-in',
    });
    if (!res.ok) {
      showToast({ tone: 'error', title: 'Cannot create walk-in', description: res.error });
      return;
    }
    setWalkInOpen(false);
    setWName('');
    setWPhone('');
    setWEmail('');
    showToast({ tone: 'success', title: `Walk-in ${res.booking.id} created`, description: `Assigned Room ${res.booking.roomNumber ?? 'at desk'}.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Bookings & Front-Desk Ledger
          </h1>
          <p className="text-sm text-text-secondary">
            Manage reservations, walk-in entries, GST invoices, and automated checkout housekeeping.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4" aria-hidden="true" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setWalkInOpen(true)}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            New Walk-in Booking
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <Tabs<FilterTab>
          ariaLabel="Filter bookings by status"
          value={statusTab}
          onChange={setStatusTab}
          options={[
            { value: 'All', label: 'All', count: state.bookings.length },
            { value: 'Confirmed', label: 'Confirmed', count: state.bookings.filter((b) => b.status === 'Confirmed').length },
            { value: 'Checked-in', label: 'Checked-in', count: state.bookings.filter((b) => b.status === 'Checked-in').length },
            { value: 'Pending', label: 'Pending', count: state.bookings.filter((b) => b.status === 'Pending').length },
            { value: 'Checked-out', label: 'Checked-out' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
        />

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search bookings by ID, guest name, or phone"
            placeholder="Search ID, name, or phone..."
            className="min-h-[44px] w-full pl-9 pr-3 rounded-lg bg-surface-raised border border-border-subtle text-sm"
          />
        </div>
      </div>

      {/* Table (Desktop) + Card Fallback (Mobile) */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No matching bookings"
          description="Clear your search query or switch status filters to see reservations."
          actionLabel="Show All Bookings"
          onAction={() => {
            setQuery('');
            setStatusTab('All');
          }}
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border-subtle bg-surface-raised shadow-card no-print">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-surface-base sticky top-0 border-b border-border-subtle">
                <tr>
                  <th className="p-3.5 font-semibold">Booking ID</th>
                  <th className="p-3.5 font-semibold">Guest</th>
                  <th className="p-3.5 font-semibold">Room</th>
                  <th className="p-3.5 font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setSortField('checkIn');
                        setSortAsc((v) => !v);
                      }}
                      className="inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      Dates <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="p-3.5 font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setSortField('totalAmount');
                        setSortAsc((v) => !v);
                      }}
                      className="inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      Total <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </th>
                  <th className="p-3.5 font-semibold">Payment</th>
                  <th className="p-3.5 font-semibold">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((b) => {
                  const roomLabel = roomMap.get(b.roomTypeId) ?? b.roomTypeId;
                  return (
                    <tr key={b.id} className="hover:bg-surface-base/60">
                      <td className="p-3.5 font-medium tabular-nums whitespace-nowrap">
                        {b.id}
                        <span className="block text-xs text-text-secondary">{b.source}</span>
                      </td>
                      <td className="p-3.5">
                        <p className="font-medium text-text-primary">{b.guestName}</p>
                        <p className="text-xs text-text-secondary tabular-nums">{b.guestPhone}</p>
                      </td>
                      <td className="p-3.5">
                        <p>{roomLabel}</p>
                        <p className="text-xs text-text-secondary tabular-nums">
                          {b.roomNumber ? `Room ${b.roomNumber}` : 'Assign on check-in'}
                        </p>
                      </td>
                      <td className="p-3.5 tabular-nums whitespace-nowrap text-xs">
                        {formatDisplayDate(b.checkIn)} → {formatDisplayDate(b.checkOut)}
                        <span className="block text-text-secondary">{b.nights} night(s)</span>
                      </td>
                      <td className="p-3.5 font-semibold tabular-nums whitespace-nowrap">
                        {formatInr(b.totalAmount)}
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() =>
                            repo.updateBookingPayment(
                              b.id,
                              b.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid'
                            )
                          }
                          className={`text-xs font-semibold px-2 py-1 rounded cursor-pointer ${
                            b.paymentStatus === 'Paid'
                              ? 'bg-status-success/15 text-status-success'
                              : 'bg-status-warning/15 text-status-warning'
                          }`}
                        >
                          {b.paymentStatus} ({b.paymentMode})
                        </button>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <select
                            aria-label={`Change status for ${b.id}`}
                            value={b.status}
                            onChange={(e) => handleStatusChange(b, e.target.value as BookingStatus)}
                            className="min-h-[36px] px-2 rounded border border-border-subtle bg-surface-raised text-xs font-medium"
                          >
                            {(['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled', 'No-show'] as const).map(
                              (st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              )
                            )}
                          </select>
                          <button
                            type="button"
                            onClick={() => setInvoiceBooking(b)}
                            aria-label={`Open GST invoice for ${b.id}`}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded border border-border-subtle hover:bg-surface-muted cursor-pointer"
                          >
                            <Printer className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <a
                            href={buildWhatsAppConfirmationUrl(b, roomLabel, state.siteContent.whatsappNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Send WhatsApp confirmation to ${b.guestName}`}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded border border-border-subtle hover:bg-surface-muted"
                          >
                            <MessageCircle className="w-4 h-4 text-status-success" aria-hidden="true" />
                          </a>
                          <a
                            href={buildMailtoConfirmationUrl(b, roomLabel)}
                            aria-label={`Email confirmation to ${b.guestName}`}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded border border-border-subtle hover:bg-surface-muted"
                          >
                            <Mail className="w-4 h-4 text-status-info" aria-hidden="true" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Fallback */}
          <div className="md:hidden space-y-3 no-print">
            {filtered.map((b) => {
              const roomLabel = roomMap.get(b.roomTypeId) ?? b.roomTypeId;
              return (
                <div key={b.id} className="p-4 rounded-xl bg-surface-raised border border-border-subtle space-y-3 text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary truncate">{b.guestName}</p>
                      <p className="text-xs text-text-secondary tabular-nums">{b.id} · {b.guestPhone}</p>
                    </div>
                    <span className="font-bold text-action-primary tabular-nums shrink-0">{formatInr(b.totalAmount)}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                    <span>
                      {roomLabel} · {formatDisplayDate(b.checkIn)} → {formatDisplayDate(b.checkOut)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        repo.updateBookingPayment(
                          b.id,
                          b.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid'
                        )
                      }
                      className={`text-xs font-semibold px-2 py-1 rounded cursor-pointer ${
                        b.paymentStatus === 'Paid'
                          ? 'bg-status-success/15 text-status-success'
                          : 'bg-status-warning/15 text-status-warning'
                      }`}
                    >
                      {b.paymentStatus} ({b.paymentMode})
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-border-subtle">
                    <select
                      aria-label={`Status for ${b.id}`}
                      value={b.status}
                      onChange={(e) => handleStatusChange(b, e.target.value as BookingStatus)}
                      className="min-h-[40px] flex-1 min-w-[120px] px-2.5 rounded border border-border-subtle bg-surface-base text-xs font-medium"
                    >
                      {(['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled', 'No-show'] as const).map(
                        (st) => (
                          <option key={st} value={st}>{st}</option>
                        )
                      )}
                    </select>
                    <div className="flex items-center gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => setInvoiceBooking(b)}>
                        <Printer className="w-4 h-4" aria-hidden="true" /> Invoice
                      </Button>
                      <a
                        href={buildWhatsAppConfirmationUrl(b, roomLabel, state.siteContent.whatsappNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Send WhatsApp confirmation to ${b.guestName}`}
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-muted"
                      >
                        <MessageCircle className="w-4 h-4 text-status-success" aria-hidden="true" />
                      </a>
                      <a
                        href={buildMailtoConfirmationUrl(b, roomLabel)}
                        aria-label={`Email confirmation to ${b.guestName}`}
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-muted"
                      >
                        <Mail className="w-4 h-4 text-status-info" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* GST Invoice Modal */}
      <Modal
        isOpen={Boolean(invoiceBooking)}
        onClose={() => setInvoiceBooking(null)}
        title={invoiceBooking ? `Tax Invoice · ${invoiceBooking.invoiceNumber}` : 'Invoice'}
        subtitle="Hotel Ramniwas · 228 Station Rd, Jalgaon 425001"
      >
        {invoiceBooking && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-surface-base border border-border-subtle">
              <div>
                <p className="text-xs text-text-secondary">Billed To</p>
                <p className="font-semibold">{invoiceBooking.guestName}</p>
                <p className="text-xs text-text-secondary tabular-nums">{invoiceBooking.guestPhone}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-text-secondary">Booking ID</p>
                <p className="font-semibold tabular-nums">{invoiceBooking.id}</p>
                <p className="text-xs text-text-secondary">SAC 996311 (Hotel Accommodation)</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border-subtle pt-3">
              <div className="flex justify-between">
                <span>
                  {roomMap.get(invoiceBooking.roomTypeId)} ({invoiceBooking.nights} night(s) ×{' '}
                  {formatInr(invoiceBooking.nightlyRate)})
                </span>
                <span className="tabular-nums">{formatInr(invoiceBooking.subtotal)}</span>
              </div>
              {invoiceBooking.discountAmount > 0 && (
                <div className="flex justify-between text-status-success">
                  <span>Direct Offer Discount</span>
                  <span className="tabular-nums">-{formatInr(invoiceBooking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>CGST + SGST ({Math.round(invoiceBooking.gstRate * 100)}%)</span>
                <span className="tabular-nums">{formatInr(invoiceBooking.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border-subtle">
                <span>Grand Total</span>
                <span className="tabular-nums">{formatInr(invoiceBooking.totalAmount)}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 no-print">
              <Button variant="secondary" onClick={() => setInvoiceBooking(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => window.print()}>
                <Printer className="w-4 h-4" aria-hidden="true" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Walk-in Booking Modal */}
      <Modal
        isOpen={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        title="Register Walk-in Guest"
        subtitle="Automatically checks inventory and assigns an open room unit."
      >
        <form onSubmit={handleCreateWalkIn} className="space-y-4">
          <SelectField
            label="Room Category"
            value={wRoomId}
            onChange={(e) => setWRoomId(e.target.value)}
          >
            {state.roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} ({formatInr(rt.baseRate)}/nt)
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Check-in Date"
              type="date"
              required
              value={wCheckIn}
              onChange={(e) => setWCheckIn(e.target.value)}
            />
            <InputField
              label="Check-out Date"
              type="date"
              required
              value={wCheckOut}
              onChange={(e) => setWCheckOut(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Guest Name" required value={wName} onChange={(e) => setWName(e.target.value)} />
            <InputField label="10-Digit Mobile" required value={wPhone} onChange={(e) => setWPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Email (Optional)" type="email" value={wEmail} onChange={(e) => setWEmail(e.target.value)} />
            <SelectField label="Payment Mode" value={wPayMode} onChange={(e) => setWPayMode(e.target.value as PaymentMode)}>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Pay at Hotel">Pay at Hotel</option>
            </SelectField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setWalkInOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Walk-in</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
