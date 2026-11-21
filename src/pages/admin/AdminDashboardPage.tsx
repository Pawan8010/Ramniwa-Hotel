import React from 'react';
import { AlertTriangle, CalendarCheck, CheckCircle2, ClipboardList, IndianRupee, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { TODAY_ISO } from '../../data/seed';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useHotelData } from '../../hooks/useRepository';
import { useToast } from '../../hooks/useToast';
import { formatDisplayDate, formatInr } from '../../utils/validators';

export function AdminDashboardPage() {
  useDocumentMeta('Operations Overview · Hotel Ramniwas Admin', 'Live hotel occupancy, revenue, and front-desk summary.');

  const { state, repo } = useHotelData();
  const { showToast } = useToast();

  const todayCheckIns = state.bookings.filter(
    (b) => b.checkIn === TODAY_ISO && (b.status === 'Confirmed' || b.status === 'Checked-in')
  );
  const todayCheckOuts = state.bookings.filter(
    (b) => b.checkOut === TODAY_ISO && (b.status === 'Checked-in' || b.status === 'Checked-out')
  );
  const occupiedCount = state.roomUnits.filter((u) => u.status === 'Occupied').length;
  const occupancyPct = Math.round((occupiedCount / Math.max(1, state.roomUnits.length)) * 100);

  const validBookings = state.bookings.filter((b) => b.status !== 'Cancelled' && b.status !== 'No-show');
  const todayRevenue = validBookings
    .filter((b) => b.checkIn <= TODAY_ISO && b.checkOut > TODAY_ISO)
    .reduce((sum, b) => sum + b.nightlyRate, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekIso = weekAgo.toISOString().slice(0, 10);
  const weekRevenue = validBookings
    .filter((b) => b.checkIn >= weekIso)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const monthRevenue = validBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const openHousekeeping = state.housekeeping.filter((t) => t.status !== 'Done').length;
  const pendingReviews = state.reviews.filter((r) => r.status === 'Pending').length;
  const openEnquiries = state.enquiries.filter((e) => e.status !== 'Resolved').length;

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (5 - i));
    const iso = d.toISOString().slice(0, 10);
    const activeOnDay = validBookings.filter((b) => b.checkIn <= iso && b.checkOut > iso);
    const dayRev = activeOnDay.reduce((sum, b) => sum + b.nightlyRate, 0);
    return {
      day: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue: dayRev,
      rooms: activeOnDay.length,
    };
  });

  const upcomingBookings = state.bookings
    .filter((b) => b.checkIn >= TODAY_ISO && b.status !== 'Cancelled')
    .slice(0, 6);

  const roomMap = new Map(state.roomTypes.map((r) => [r.id, r.shortName]));

  const handleRunNoShow = () => {
    const flagged = repo.autoFlagNoShows();
    showToast({
      tone: flagged > 0 ? 'warning' : 'info',
      title: flagged > 0 ? `${flagged} overdue booking(s) flagged as No-show` : 'No overdue arrivals found',
      description: 'Confirmed bookings past check-in date are automatically flagged.',
    });
  };

  return (
    <div className="space-y-8">
      {/* Daily Summary Banner on Login */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface-strong border border-border-strong text-text-primary flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-accent">
            Daily Front-Desk Briefing · {formatDisplayDate(TODAY_ISO)}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-tertiary mt-1">
            {todayCheckIns.length} Arrivals & {todayCheckOuts.length} Departures Today
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {openHousekeeping} housekeeping task(s) open · {pendingReviews} review(s) awaiting moderation · {openEnquiries} guest enquiry/order(s) active.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Button variant="primary" size="sm" onClick={handleRunNoShow}>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Run No-Show Check
          </Button>
          <Link to="/admin/bookings">
            <Button variant="secondary" size="sm">
              Manage Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="spotlight-card p-5 rounded-xl bg-surface-raised border border-border-subtle shadow-card">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Occupancy (32 Rooms)</span>
            <CheckCircle2 className="w-4 h-4 text-status-success" aria-hidden="true" />
          </div>
          <p className="font-ui text-3xl font-bold text-text-tertiary mt-2 tabular-nums">
            {occupancyPct}%
          </p>
          <p className="text-xs text-text-secondary mt-1 tabular-nums">
            {occupiedCount} occupied · {32 - occupiedCount} other status
          </p>
        </div>

        <div className="spotlight-card p-5 rounded-xl bg-surface-raised border border-border-subtle shadow-card">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Revenue Today</span>
            <IndianRupee className="w-4 h-4 text-text-accent" aria-hidden="true" />
          </div>
          <p className="font-ui text-3xl font-bold text-text-tertiary mt-2 tabular-nums">
            {formatInr(todayRevenue)}
          </p>
          <p className="text-xs text-text-secondary mt-1 tabular-nums">
            7-day total: {formatInr(weekRevenue)}
          </p>
        </div>

        <div className="spotlight-card p-5 rounded-xl bg-surface-raised border border-border-subtle shadow-card">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Monthly Ledger</span>
            <CalendarCheck className="w-4 h-4 text-text-accent" aria-hidden="true" />
          </div>
          <p className="font-ui text-3xl font-bold text-text-tertiary mt-2 tabular-nums">
            {formatInr(monthRevenue)}
          </p>
          <p className="text-xs text-text-secondary mt-1 tabular-nums">
            Across {validBookings.length} active/completed stays
          </p>
        </div>

        <div className="spotlight-card p-5 rounded-xl bg-surface-raised border border-border-subtle shadow-card">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Housekeeping Queue</span>
            <ClipboardList className="w-4 h-4 text-status-warning" aria-hidden="true" />
          </div>
          <p className="font-ui text-3xl font-bold text-text-tertiary mt-2 tabular-nums">
            {openHousekeeping}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Auto-created on every guest checkout
          </p>
        </div>
      </div>

      {/* Chart + Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-surface-raised border border-border-subtle shadow-card">
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold text-text-tertiary">
              7-Day Room Revenue Trend (INR)
            </h2>
            <p className="text-xs text-text-secondary">
              Computed live from current booking inventory across all 4 room categories.
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(214,235,253,0.12)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#A1A4A5' }} />
                <YAxis tick={{ fontSize: 12, fill: '#A1A4A5' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0D12',
                    borderColor: 'rgba(214,235,253,0.22)',
                    borderRadius: '8px',
                    color: '#F0F0F0',
                  }}
                  formatter={(value) => [
                    `₹${Number(value ?? 0).toLocaleString('en-IN')}`,
                    'Nightly Revenue',
                  ]}
                />
                <Bar dataKey="revenue" fill="#00A3FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-raised border border-border-subtle shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-text-tertiary">
                Upcoming Arrivals
              </h2>
              <Link to="/admin/bookings" className="text-xs font-medium text-text-accent hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-border-subtle">
              {upcomingBookings.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">{b.guestName}</p>
                    <p className="text-xs text-text-secondary tabular-nums">
                      {b.id} · {roomMap.get(b.roomTypeId)} · {formatDisplayDate(b.checkIn)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-text-accent whitespace-nowrap">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {pendingReviews > 0 && (
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-status-warning font-medium">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                {pendingReviews} review(s) pending approval
              </span>
              <Link to="/admin/inbox" className="text-text-accent font-semibold hover:underline">
                Moderate
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
