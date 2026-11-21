import React, { useState } from 'react';
import { MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useHotelData } from '../../hooks/useRepository';
import { useToast } from '../../hooks/useToast';
import { isValidEmail } from '../../utils/validators';
import { Button } from '../ui/Button';

export function Footer() {
  const { lang, setLang, t } = useLanguage();
  const { state } = useHotelData();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const site = state.siteContent;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError(undefined);
    setEmail('');
    showToast({
      tone: 'success',
      title: 'Subscribed to seasonal tariffs',
      description: 'We will notify you of Jalgaon festive & direct-booking offers.',
    });
  };

  return (
    <footer className="bg-surface-raised text-text-primary border-t border-border-subtle pb-20 md:pb-0 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Property Facts */}
          <div className="space-y-4">
            <div>
              <p className="font-display text-2xl font-bold text-text-tertiary">
                {site.hotelName}
              </p>
              <p className="text-xs text-text-accent mt-1 font-medium">
                RamNivas · Est. 1975 · 4 Floors · 32 Rooms · Lift
              </p>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {site.tagline}. Comfortable 1-star business, transit, and family accommodation just a 3-minute walk from Jalgaon Junction Railway Station.
            </p>
            <div className="flex items-start gap-2.5 text-sm text-text-primary">
              <MapPin className="w-4 h-4 text-text-accent shrink-0 mt-1" aria-hidden="true" />
              <span>
                {site.address} · Plus Code {site.plusCode}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              <a
                href={`tel:${site.phonePrimary.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 text-text-primary hover:text-text-accent transition-colors"
              >
                <Phone className="w-4 h-4 text-text-accent shrink-0" aria-hidden="true" />
                <span className="tabular-nums">{site.phonePrimary}</span>
              </a>
              <a
                href={`tel:${site.phoneSecondary.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 text-text-primary hover:text-text-accent transition-colors"
              >
                <Phone className="w-4 h-4 text-text-accent shrink-0" aria-hidden="true" />
                <span className="tabular-nums">{site.phoneSecondary}</span>
              </a>
            </div>
          </div>

          {/* Guest Links */}
          <div>
            <h2 className="font-display text-lg font-semibold text-text-tertiary mb-4">
              Explore & Reservations
            </h2>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li><Link to="/rooms" className="hover:text-text-accent transition-colors">{t.navRooms}</Link></li>
              <li><Link to="/book" className="hover:text-text-accent transition-colors">Direct Room Booking</Link></li>
              <li><Link to="/my-booking" className="hover:text-text-accent transition-colors">{t.navMyBooking}</Link></li>
              <li><Link to="/amenities" className="hover:text-text-accent transition-colors">{t.navAmenities}</Link></li>
              <li><Link to="/location" className="hover:text-text-accent transition-colors">{t.navLocation}</Link></li>
              <li><Link to="/reviews" className="hover:text-text-accent transition-colors">{t.navReviews}</Link></li>
              <li><Link to="/contact" className="hover:text-text-accent transition-colors">{t.navContact}</Link></li>
            </ul>
          </div>

          {/* Policies, Language & OTA Listings */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-text-tertiary mb-4">
                Stay Policies & Listings
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Check-in {site.checkInTime} · Check-out {site.checkOutTime} · Valid govt. photo ID mandatory · Age 18+ · Cash, Cards, UPI & GST invoice accepted.
              </p>
              <p className="text-xs text-text-secondary mt-3">
                Also listed on: MakeMyTrip · Agoda · Goibibo · Tripadvisor
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-text-secondary mb-2">Language / भाषा</p>
              <div className="inline-flex rounded-lg border border-border-subtle bg-surface-base p-1 gap-1">
                {(['en', 'hi', 'mr'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    className={`min-h-[36px] px-3 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      lang === code
                        ? 'bg-action-primary text-text-inverse font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {code === 'en' ? 'EN' : code === 'hi' ? 'हिन्दी' : 'मराठी'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seasonal Updates Newsletter */}
          <div>
            <h2 className="font-display text-lg font-semibold text-text-tertiary mb-4">
              Direct Tariff Alerts
            </h2>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              Receive seasonal Jalgaon travel updates and direct-booking promo codes—never spam.
            </p>
            <form onSubmit={handleSubscribe} noValidate className="space-y-2.5">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address for direct tariff alerts
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={Boolean(emailError) || undefined}
                className="w-full min-h-[44px] rounded-lg px-3.5 py-2 text-sm bg-surface-base border border-border-subtle text-text-primary placeholder:text-text-secondary/60"
              />
              {emailError && (
                <p className="text-xs text-status-error" role="alert">
                  {emailError}
                </p>
              )}
              <Button type="submit" variant="primary" size="sm" className="w-full">
                Subscribe for Offers
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} Hotel Ramniwas, Jalgaon. Serving travellers since 1975.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy" className="hover:text-text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-text-accent transition-colors">
              Terms & House Rules
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 hover:text-text-accent transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Staff Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
