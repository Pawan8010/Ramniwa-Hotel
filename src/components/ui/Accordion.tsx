import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
}

export function Accordion({ items, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? items[0]?.id ?? null);
  const baseId = useId();

  return (
    <div className="divide-y divide-border-subtle border border-border-subtle rounded-xl bg-surface-raised overflow-hidden">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const headerId = `${baseId}-hdr-${item.id}`;
        const panelId = `${baseId}-pnl-${item.id}`;

        return (
          <div key={item.id}>
            <h3>
              <button
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="w-full min-h-[52px] flex items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium text-text-primary hover:bg-surface-base/70 transition-colors cursor-pointer"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-text-secondary shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className="px-5 pb-4 text-sm text-text-secondary leading-relaxed"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
