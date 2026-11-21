import React, { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../ui/Button';

export function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useFocusTrap(mobileOpen, () => setMobileOpen(false), drawerRef);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(1, y / docHeight) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { to: '/rooms', label: t.navRooms },
    { to: '/amenities', label: t.navAmenities },
    { to: '/location', label: t.navLocation },
    { to: '/reviews', label: t.navReviews },
    { to: '/contact', label: t.navContact },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-action-primary focus:text-text-inverse focus:font-semibold"
      >
        {t.skipToContent}
      </a>

      <header
        className={[
          'sticky top-0 z-40 w-full transition-all duration-200 border-b',
          scrolled
            ? 'bg-surface-base/85 backdrop-blur-xl border-border-strong shadow-card py-2.5'
            : 'bg-surface-base/90 backdrop-blur-md border-border-subtle py-3.5',
        ].join(' ')}
      >
        {/* Electric cyan scroll progress bar */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[2px] bg-action-primary origin-left transition-transform duration-75"
          style={{ transform: `scaleX(${scrollProgress})` }}
        />

        {/* Strictly 3-Zone Top Bar Contract */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8">
          <Link
            to="/"
            className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-text-tertiary whitespace-nowrap shrink-0"
          >
            Hotel Ramniwas
          </Link>

          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'nav-link-underline text-sm font-medium whitespace-nowrap shrink-0 transition-colors',
                    isActive ? 'text-text-accent font-semibold' : 'text-text-secondary hover:text-text-primary',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/book" className="hidden sm:inline-flex">
              <Button variant="primary" size="sm">
                {t.navBookNow}
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label="Open navigation menu"
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-border-subtle bg-surface-raised text-text-primary hover:bg-surface-muted cursor-pointer"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-surface-base/75 backdrop-blur-sm lg:hidden flex justify-end"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        >
          <div
            id="mobile-nav-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            tabIndex={-1}
            className="w-full max-w-xs h-full bg-surface-raised border-l border-border-strong p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <span className="font-display text-lg font-semibold text-text-tertiary">
                  Hotel Ramniwas
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-muted cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile navigation" className="mt-4 flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `min-h-[44px] flex items-center px-3 rounded-lg text-base font-medium ${
                        isActive
                          ? 'bg-action-primary text-text-inverse font-semibold'
                          : 'text-text-primary hover:bg-surface-muted'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <Link
                  to="/my-booking"
                  className="min-h-[44px] flex items-center px-3 rounded-lg text-base font-medium text-text-primary hover:bg-surface-muted"
                >
                  {t.navMyBooking}
                </Link>
                <Link
                  to="/admin"
                  className="min-h-[44px] flex items-center px-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted"
                >
                  Staff Admin Portal
                </Link>
              </nav>

              <div className="mt-6 pt-5 border-t border-border-subtle">
                <p className="text-xs font-medium text-text-secondary mb-2">Language</p>
                <div className="flex items-center gap-1.5">
                  {(['en', 'hi', 'mr'] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLang(code)}
                      className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                        lang === code
                          ? 'bg-action-primary text-text-inverse'
                          : 'bg-surface-base border border-border-subtle text-text-primary'
                      }`}
                    >
                      {code === 'en' ? 'English' : code === 'hi' ? 'हिन्दी' : 'मराठी'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border-subtle">
              <Link to="/book" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  {t.navBookNow}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
