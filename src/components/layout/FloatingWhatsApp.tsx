import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useHotelData } from '../../hooks/useRepository';

export function FloatingWhatsApp() {
  const { state } = useHotelData();
  const url = `https://wa.me/${state.siteContent.whatsappNumber}?text=${encodeURIComponent(
    'Namaste Hotel Ramniwas, Jalgaon. I would like assistance with a room booking.'
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Hotel Ramniwas front desk on WhatsApp"
      className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 rounded-full bg-surface-raised text-text-primary border border-action-primary/60 shadow-modal hover:bg-surface-muted transition-colors animate-whatsapp-pulse no-print"
    >
      <MessageCircle className="w-5 h-5 text-action-primary shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium whitespace-nowrap">WhatsApp Desk</span>
    </a>
  );
}
