import React, { createContext, useContext, useState } from 'react';
import { TRANSLATIONS } from '../data/i18n';
import type { Language } from '../types/hotel';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof TRANSLATIONS)['en'];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const LANG_KEY = 'ramniwas_lang_v1';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY) as Language | null;
    return saved === 'hi' || saved === 'mr' ? saved : 'en';
  });

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem(LANG_KEY, next);
    document.documentElement.lang = next;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
