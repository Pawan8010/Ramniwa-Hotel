import React from 'react';
import { CalendarCheck, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useHotelData } from '../../hooks/useRepository';

export function MobileBottomBar() {
  const { t } = useLanguage();
  const { state } = useHotelData();
  const site = state.siteContent;

  return (
    <nav
      aria-label="Quick mobile actions"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-surface-raised/95 backdrop-blur-xl border-t border-border-strong shadow-modal grid grid-cols-3 divide-x divide-border-subtle no-print"
    >
      <a
        href={`tel:${site.phonePrimary.replace(/\s+/g, '')}`}
        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors"
      >
        <Phone className="w-4 h-4 text-text-accent" aria-hidden="true" />
        <span>Call</span>
      </a>
      <a
        href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
          'Namaste Hotel Ramniwas, I would like to enquire about room availability.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors"
      >
        <MessageCircle className="w-4 h-4 text-status-success" aria-hidden="true" />
        <span>WhatsApp</span>
      </a>
      <Link
        to="/book"
        className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-action-primary text-text-inverse hover:bg-action-primary-hover transition-colors"
      >
        <CalendarCheck className="w-4 h-4" aria-hidden="true" />
        <span>{t.navBookNow}</span>
      </Link>
    </nav>
  );
}
