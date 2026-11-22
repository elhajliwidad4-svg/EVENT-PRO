import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type {
  AuthUser,
  CompanySettings,
  GalleryImage,
  ServiceCategory,
  ServiceItem,
  Testimonial,
} from '../types/index.ts';

// Keep Bearer tokens strictly in JS memory (never in localStorage or sessionStorage)
let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (inMemoryToken) {
    headers.set('Authorization', `Bearer ${inMemoryToken}`);
  }
  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    if (!res.ok) throw new Error('Erreur lors de l’export CSV.');
    return (await res.text()) as unknown as T;
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Une erreur est survenue.');
  }
  return data as T;
}

interface AppDataContextValue {
  settings: CompanySettings;
  categories: ServiceCategory[];
  services: ServiceItem[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  loading: boolean;
  user: AuthUser | null;
  setUserSession: (user: AuthUser | null, token: string | null) => void;
  refreshPublicData: () => Promise<void>;
}

const DEFAULT_SETTINGS: CompanySettings = {
  id: 'default',
  company_name: 'EVENT PRO',
  slogan_fr: 'Vos événements, notre expertise. Vos moments, notre passion.',
  phone: '+212 5 22 00 00 00',
  whatsapp_number: '',
  email: 'contact@eventpro.ma',
  address: 'Casablanca & Grand Casablanca (Anfa, Ain Diab, Bouskoura, Dar Bouazza)',
  service_area: 'Casablanca, Bouskoura, Dar Bouazza, Mohammedia, Rabat',
  instagram_url: 'https://instagram.com',
  facebook_url: 'https://facebook.com',
  currency: 'MAD',
  booking_notice_fr:
    'Toute demande de réservation fait l’objet d’une étude personnalisée et d’un devis détaillé sous 24h ouvrées.',
  logo_url: '',
};

const AppDataContext = createContext<AppDataContextValue>({
  settings: DEFAULT_SETTINGS,
  categories: [],
  services: [],
  gallery: [],
  testimonials: [],
  loading: true,
  user: null,
  setUserSession: () => {},
  refreshPublicData: async () => {},
});

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshPublicData = useCallback(async () => {
    try {
      const data = await apiFetch<{
        settings: CompanySettings;
        categories: ServiceCategory[];
        services: ServiceItem[];
        gallery: GalleryImage[];
        testimonials: Testimonial[];
      }>('/api/public/bootstrap');
      if (data.settings && data.settings.company_name) {
        setSettings(data.settings);
      }
      setCategories(data.categories || []);
      setServices(data.services || []);
      setGallery(data.gallery || []);
      setTestimonials(data.testimonials || []);
    } catch (err) {
      console.error('Bootstrap load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPublicData();
  }, [refreshPublicData]);

  const setUserSession = useCallback((nextUser: AuthUser | null, token: string | null) => {
    setAuthToken(token);
    setUser(nextUser);
  }, []);

  return React.createElement(
    AppDataContext.Provider,
    {
      value: {
        settings,
        categories,
        services,
        gallery,
        testimonials,
        loading,
        user,
        setUserSession,
        refreshPublicData,
      },
    },
    children
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
