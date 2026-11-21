import React, { useRef, useState } from 'react';
import {
  BedDouble,
  CalendarCheck2,
  ClipboardList,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Percent,
  X,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { AdminLoginPage, isAdminAuthenticated, logoutAdmin } from './AdminAuth';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck2 },
  { to: '/admin/rooms', label: 'Rooms & 32-Grid', icon: BedDouble },
  { to: '/admin/rates', label: 'Rates & Promos', icon: Percent },
  { to: '/admin/housekeeping', label: 'Housekeeping', icon: ClipboardList },
  { to: '/admin/inbox', label: 'Reviews & Inbox', icon: Inbox },
  { to: '/admin/media', label: 'Media Manager', icon: ImageIcon },
  { to: '/admin/content', label: 'Site Content', icon: FileText },
];

export function AdminLayout() {
  const [authed, setAuthed] = useState(() => isAdminAuthenticated());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useFocusTrap(mobileMenuOpen, () => setMobileMenuOpen(false), drawerRef);

  if (!authed) {
    return <AdminLoginPage onSuccess={() => setAuthed(true)} />;
  }

  const currentLink =
    ADMIN_LINKS.find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to))) ??
    ADMIN_LINKS[0];

  const handleLogout = () => {
    logoutAdmin();
    setAuthed(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-6">
        <div className="px-2 pt-1">
          <p className="font-display text-lg font-bold text-text-primary">Hotel Ramniwas</p>
          <p className="text-xs text-text-secondary">Property Operations · 32 Rooms</p>
        </div>

        <nav aria-label="Admin sidebar navigation" className="space-y-1">
          {ADMIN_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    'min-h-[42px] flex items-center gap-3 px-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-action-primary text-text-inverse'
                      : 'text-text-primary hover:bg-surface-muted',
                  ].join(' ')
                }
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-border-subtle space-y-1.5">
        <Link
          to="/"
          className="min-h-[40px] flex items-center justify-between px-3 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary"
        >
          <span>View Public Website</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full min-h-[40px] flex items-center gap-2.5 px-3 rounded-lg text-xs font-medium text-status-error hover:bg-status-error/10 cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-base text-text-primary flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-surface-raised border-r border-border-subtle sticky top-0 h-screen overflow-y-auto no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-surface-base/80 backdrop-blur-sm lg:hidden flex"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            tabIndex={-1}
            className="w-64 bg-surface-raised h-full border-r border-border-subtle overflow-y-auto"
          >
            <div className="flex justify-end p-2">
              <button
                type="button"
                aria-label="Close admin menu"
                onClick={() => setMobileMenuOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-muted cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-surface-raised/95 backdrop-blur-sm border-b border-border-subtle px-4 sm:px-6 py-3 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open admin navigation"
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-border-subtle hover:bg-surface-muted cursor-pointer"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <p className="text-sm text-text-secondary">
              Admin <span aria-hidden="true">/</span>{' '}
              <span className="font-semibold text-text-primary">{currentLink.label}</span>
            </p>
          </div>
          <Link to="/admin/bookings" className="text-xs font-medium text-action-primary hover:underline">
            + Walk-in Desk
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
