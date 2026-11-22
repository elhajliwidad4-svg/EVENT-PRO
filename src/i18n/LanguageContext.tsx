import React, { createContext, useContext, useEffect, useState } from 'react';

export type Locale = 'fr' | 'ar';

interface Translations {
  nav: {
    home: string;
    services: string;
    events: string;
    gallery: string;
    about: string;
    contact: string;
    book: string;
    quote: string;
    clientPortal: string;
    adminPortal: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  common: {
    discover: string;
    requestQuote: string;
    learnMore: string;
    priceOnQuote: string;
    examplePriceNote: string;
    loading: string;
  };
}

const DICTIONARY: Record<Locale, Translations> = {
  fr: {
    nav: {
      home: 'Accueil',
      services: 'Nos services',
      events: 'Nos événements',
      gallery: 'Galerie',
      about: 'À propos',
      contact: 'Contact',
      book: 'Réserver',
      quote: 'Demander un devis',
      clientPortal: 'Espace client',
      adminPortal: 'Administration',
    },
    hero: {
      kicker: 'Casablanca · Maroc',
      headline: 'Donnez vie à vos plus beaux événements.',
      subheadline:
        'EVENT PRO vous accompagne dans la conception, l’organisation et la réalisation de vos événements à Casablanca. Chaque détail compte, chaque moment devient mémorable.',
      primaryCta: 'Organiser mon événement',
      secondaryCta: 'Découvrir nos services',
    },
    common: {
      discover: 'Découvrir',
      requestQuote: 'Demander un devis',
      learnMore: 'En savoir plus',
      priceOnQuote: 'Tarif sur devis',
      examplePriceNote: 'À titre indicatif dès',
      loading: 'Chargement en cours...',
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      services: 'خدماتنا',
      events: 'فعالياتنا',
      gallery: 'المعرض',
      about: 'من نحن',
      contact: 'اتصل بنا',
      book: 'احجز الآن',
      quote: 'اطلب عرض سعر',
      clientPortal: 'فضاء العميل',
      adminPortal: 'الإدارة',
    },
    hero: {
      kicker: 'الدار البيضاء · المغرب',
      headline: 'امنحوا أجمل فعالياتكم الحياة.',
      subheadline:
        'ترافقكم EVENT PRO في تصميم وتنظيم وتنفيذ حفلاتكم وفعالياتكم في الدار البيضاء. كل تفصيل يصنع لحظة لا تُنسى.',
      primaryCta: 'نظّم مناسبتك',
      secondaryCta: 'اكتشف خدماتنا',
    },
    common: {
      discover: 'اكتشف',
      requestQuote: 'اطلب عرض سعر',
      learnMore: 'المزيد من التفاصيل',
      priceOnQuote: 'السعر حسب الطلب',
      examplePriceNote: 'ابتداءً من (تقديري)',
      loading: 'جاري التحميل...',
    },
  },
};

interface LanguageContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (loc: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'fr',
  dir: 'ltr',
  setLocale: () => {},
  t: DICTIONARY.fr,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr');
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return (
    <LanguageContext.Provider value={{ locale, dir, setLocale, t: DICTIONARY[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function formatMAD(amount: number): string {
  return `${new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(amount)} MAD`;
}

export function formatDateFr(dateStr?: string | null): string {
  if (!dateStr) return 'Date à confirmer';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Casablanca',
  }).format(parsed);
}
