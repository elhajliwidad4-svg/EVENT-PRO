import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  Image as ImageIcon,
  Layers,
  LogOut,
  Mail,
  Plus,
  Printer,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import { apiFetch, getAuthToken, useAppData } from '../lib/api.ts';
import { formatDateFr, formatMAD } from '../i18n/LanguageContext.tsx';
import type {
  BookingRecord,
  CompanySettings,
  ContactMessageRecord,
  CustomerProfile,
  GalleryImage,
  QuoteItemRecord,
  QuoteRecord,
  ServiceCategory,
  ServiceItem,
} from '../types/index.ts';
import { SafeImage } from '../components/ui/SafeImage.tsx';

type AdminSection =
  | 'overview'
  | 'bookings'
  | 'quotes'
  | 'services'
  | 'gallery'
  | 'customers'
  | 'messages'
  | 'settings';

const BOOKING_STATUSES = [
  'Nouvelle demande',
  'En cours',
  'Devis envoyé',
  'En attente du client',
  'Confirmé',
  'Refusé',
  'Annulé',
];

const QUOTE_STATUSES = [
  'Nouvelle demande',
  'En cours',
  'Devis envoyé',
  'En attente du client',
  'Accepté',
  'Refusé',
  'Annulé',
];

export function AdminDashboardPage() {
  const { user, setUserSession, refreshPublicData } = useAppData();

  const [adminStatus, setAdminStatus] = useState<'loading' | 'unclaimed' | 'ready'>('loading');
  const [loginForm, setLoginForm] = useState({ email: 'admin@eventpro.ma', password: '', full_name: '' });
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const [section, setSection] = useState<AdminSection>('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Overview state
  const [overview, setOverview] = useState<{
    stats: Record<string, number>;
    recent_bookings: BookingRecord[];
    recent_messages: ContactMessageRecord[];
  } | null>(null);

  // Bookings state
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('Tous');
  const [bookingSort, setBookingSort] = useState<'created_desc' | 'date_asc'>('created_desc');
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);

  // Quotes state
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [activeQuote, setActiveQuote] = useState<QuoteRecord | null>(null);
  const [printableQuote, setPrintableQuote] = useState<QuoteRecord | null>(null);
  const [newQuoteForm, setNewQuoteForm] = useState({
    customer_id: '',
    event_type: 'Mariage',
    event_date: '',
    event_location: 'Casablanca',
    guest_count: 100,
    discount_mad: 0,
    admin_notes: '',
  });
  const [showNewQuote, setShowNewQuote] = useState(false);

  // Services state
  const [adminServices, setAdminServices] = useState<ServiceItem[]>([]);
  const [adminCategories, setAdminCategories] = useState<ServiceCategory[]>([]);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);

  // Gallery state
  const [adminGallery, setAdminGallery] = useState<GalleryImage[]>([]);
  const [newGallery, setNewGallery] = useState({
    title: '',
    caption: '',
    category: 'Mariages',
    image_url: '',
    r2_key: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Customers & Messages
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);

  // Settings
  const [settingsForm, setSettingsForm] = useState<CompanySettings | null>(null);

  useEffect(() => {
    apiFetch<{ configured: boolean; mode: string }>('/api/auth/admin-status')
      .then((res) => {
        setAdminStatus(res.mode === 'unclaimed' ? 'unclaimed' : 'ready');
      })
      .catch(() => setAdminStatus('ready'));
  }, []);

  const loadAllAdminData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setLoadingData(true);
    try {
      const [ov, bk, qt, sv, pub, cs, ms, st] = await Promise.all([
        apiFetch<{ stats: Record<string, number>; recent_bookings: BookingRecord[]; recent_messages: ContactMessageRecord[] }>('/api/admin/overview'),
        apiFetch<{ bookings: BookingRecord[] }>('/api/admin/bookings'),
        apiFetch<{ quotes: QuoteRecord[] }>('/api/admin/quotes'),
        apiFetch<{ categories: ServiceCategory[]; services: ServiceItem[] }>('/api/admin/services'),
        apiFetch<{ gallery: GalleryImage[] }>('/api/public/bootstrap'),
        apiFetch<{ customers: CustomerProfile[] }>('/api/admin/customers'),
        apiFetch<{ messages: ContactMessageRecord[] }>('/api/admin/messages'),
        apiFetch<{ settings: CompanySettings }>('/api/admin/settings'),
      ]);
      setOverview(ov);
      setBookings(bk.bookings || []);
      setQuotes(qt.quotes || []);
      setAdminCategories(sv.categories || []);
      setAdminServices(sv.services || []);
      setAdminGallery(pub.gallery || []);
      setCustomers(cs.customers || []);
      setMessages(ms.messages || []);
      setSettingsForm(st.settings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAllAdminData();
    }
  }, [user, loadAllAdminData]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthBusy(true);
    try {
      const endpoint = adminStatus === 'unclaimed' ? '/api/auth/admin-claim' : '/api/auth/login';
      const res = await apiFetch<{ token: string; user: typeof user }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
          full_name: loginForm.full_name || 'Administrateur EVENT PRO',
          portal: 'admin',
        }),
      });
      setUserSession(res.user, res.token);
      setAdminStatus('ready');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Erreur d’accès administrateur.');
    } finally {
      setAuthBusy(false);
    }
  };

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleExportCsv = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/bookings/export', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const csv = await res.text();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event-pro-reservations.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      notify('Erreur lors de l’export CSV.');
    }
  };

  const handleBookingUpdate = async (booking: BookingRecord) => {
    try {
      await apiFetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: booking.status,
          internal_notes: booking.internal_notes || '',
          assigned_to: booking.assigned_to || '',
          event_date: booking.event_date,
        }),
      });
      notify('Réservation mise à jour.');
      await loadAllAdminData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleSaveQuote = async (quote: QuoteRecord) => {
    try {
      await apiFetch(`/api/admin/quotes/${quote.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: quote.status,
          discount_mad: Number(quote.discount_mad || 0),
          admin_notes: quote.admin_notes || '',
          valid_until: quote.valid_until || '',
          items: quote.items || [],
        }),
      });
      notify('Devis enregistré et recalculé en MAD.');
      await loadAllAdminData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde du devis.');
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/quotes', {
        method: 'POST',
        body: JSON.stringify({
          ...newQuoteForm,
          items: [{ service_name: 'Organisation & coordination', description: 'Forfait base', quantity: 1, unit_price_mad: 0 }],
        }),
      });
      setShowNewQuote(false);
      notify('Nouveau devis créé.');
      await loadAllAdminData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      if (editingService.id) {
        await apiFetch(`/api/admin/services/${editingService.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name_fr: editingService.name_fr,
            short_description_fr: editingService.short_description_fr,
            description_fr: editingService.description_fr,
            cover_image: editingService.cover_image,
            starting_price_mad:
              editingService.starting_price_mad === null || editingService.starting_price_mad === undefined
                ? null
                : Number(editingService.starting_price_mad),
            price_is_example: Boolean(editingService.price_is_example),
            is_available: editingService.is_available !== 0,
          }),
        });
      } else {
        await apiFetch('/api/admin/services', {
          method: 'POST',
          body: JSON.stringify({
            category_id: editingService.category_id || adminCategories[0]?.id,
            name_fr: editingService.name_fr,
            short_description_fr: editingService.short_description_fr,
            description_fr: editingService.description_fr,
            cover_image: editingService.cover_image,
            starting_price_mad: editingService.starting_price_mad ?? null,
            price_is_example: Boolean(editingService.price_is_example),
          }),
        });
      }
      setEditingService(null);
      notify('Prestation enregistrée.');
      await Promise.all([loadAllAdminData(), refreshPublicData()]);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteService = async (id: string) => {
    await apiFetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    notify('Prestation supprimée.');
    await Promise.all([loadAllAdminData(), refreshPublicData()]);
  };

  const handleUploadR2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiFetch<{ key: string; url: string }>('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      setNewGallery((prev) => ({ ...prev, image_url: res.url, r2_key: res.key }));
      notify('Image téléversée dans le stockage R2.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Échec du téléversement.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify(newGallery),
      });
      setNewGallery({ title: '', caption: '', category: 'Mariages', image_url: '', r2_key: '' });
      notify('Image ajoutée à la galerie.');
      await Promise.all([loadAllAdminData(), refreshPublicData()]);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    await apiFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    notify('Image supprimée.');
    await Promise.all([loadAllAdminData(), refreshPublicData()]);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    await apiFetch('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settingsForm),
    });
    notify('Paramètres enregistrés et appliqués sur le site.');
    await refreshPublicData();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-7 sm:p-9 space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#8C6F38]">
              <Shield className="w-4 h-4" />
              <span>Administration EVENT PRO</span>
            </div>
            <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
              {adminStatus === 'unclaimed'
                ? 'Initialisation du compte administrateur'
                : 'Connexion sécurisée'}
            </h1>
            <p className="text-xs text-[#5C574F] leading-relaxed">
              {adminStatus === 'unclaimed'
                ? 'Aucun mot de passe administrateur n’est encore défini. Choisissez votre mot de passe initial (8+ caractères) pour activer et verrouiller l’espace de gestion.'
                : 'Accès réservé à la direction et aux coordinateurs EVENT PRO.'}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-800">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4">
            {adminStatus === 'unclaimed' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1917]">Nom du responsable</label>
                <input
                  type="text"
                  value={loginForm.full_name}
                  onChange={(e) => setLoginForm({ ...loginForm, full_name: e.target.value })}
                  placeholder="Administrateur EVENT PRO"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] text-sm"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#1A1917]">Email administrateur</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#1A1917]">Mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={authBusy || adminStatus === 'loading'}
              className="w-full py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {authBusy
                ? 'Validation...'
                : adminStatus === 'unclaimed'
                  ? 'Activer l’accès administrateur'
                  : 'Accéder au tableau de bord'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Printable PDF Quote Overlay
  if (printableQuote) {
    const subtotal = (printableQuote.items || []).reduce(
      (sum, it) => sum + Number(it.quantity) * Number(it.unit_price_mad),
      0
    );
    const total = Math.max(0, subtotal - Number(printableQuote.discount_mad || 0));
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 bg-white min-h-screen space-y-8">
        <div className="no-print flex items-center justify-between border-b border-[#E5DFD5] pb-4">
          <button
            type="button"
            onClick={() => setPrintableQuote(null)}
            className="px-4 py-2 rounded border border-[#D5CEC2] text-xs font-medium cursor-pointer"
          >
            Retour au tableau de bord
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1A1917] text-white text-xs font-medium cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Enregistrer en PDF</span>
          </button>
        </div>

        <div className="flex justify-between items-start border-b border-[#E5DFD5] pb-6">
          <div>
            <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
              {settingsForm?.company_name || 'EVENT PRO'}
            </h1>
            <p className="text-xs text-[#5C574F]">{settingsForm?.address}</p>
            <p className="text-xs text-[#5C574F]">
              {settingsForm?.phone} · {settingsForm?.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-[#8C6F38]">Devis Événementiel</p>
            <p className="font-mono-tabular text-lg font-semibold">{printableQuote.reference_number}</p>
            <p className="text-xs text-[#5C574F]">Statut : {printableQuote.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-[#5C574F]">Client</p>
            <p className="font-medium">{printableQuote.customer?.full_name || 'Client'}</p>
            <p className="text-xs text-[#5C574F]">{printableQuote.customer?.email}</p>
            <p className="text-xs text-[#5C574F]">{printableQuote.customer?.phone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#5C574F]">Événement</p>
            <p className="font-medium">{printableQuote.event_type}</p>
            <p className="text-xs text-[#5C574F]">
              {formatDateFr(printableQuote.event_date)} · {printableQuote.event_location}
            </p>
            <p className="text-xs text-[#5C574F]">{printableQuote.guest_count} invités</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#1A1917] text-left text-xs uppercase text-[#5C574F]">
              <th className="py-2">Prestation</th>
              <th className="py-2 text-right">Qté</th>
              <th className="py-2 text-right">PU (MAD)</th>
              <th className="py-2 text-right">Total (MAD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DFD5]">
            {(printableQuote.items || []).map((it, idx) => (
              <tr key={idx}>
                <td className="py-3">
                  <p className="font-medium">{it.service_name}</p>
                  {it.description && <p className="text-xs text-[#5C574F]">{it.description}</p>}
                </td>
                <td className="py-3 text-right font-mono-tabular">{it.quantity}</td>
                <td className="py-3 text-right font-mono-tabular">{formatMAD(it.unit_price_mad)}</td>
                <td className="py-3 text-right font-mono-tabular">
                  {formatMAD(it.quantity * it.unit_price_mad)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm border-t border-[#E5DFD5] pt-4">
            <div className="flex justify-between">
              <span className="text-[#5C574F]">Sous-total</span>
              <span className="font-mono-tabular">{formatMAD(subtotal)}</span>
            </div>
            {Number(printableQuote.discount_mad || 0) > 0 && (
              <div className="flex justify-between text-[#8C6F38]">
                <span>Remise</span>
                <span className="font-mono-tabular">-{formatMAD(printableQuote.discount_mad)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base border-t border-[#1A1917] pt-2">
              <span>Total TTC</span>
              <span className="font-mono-tabular">{formatMAD(total)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings
    .filter((b) => (bookingFilter === 'Tous' ? true : b.status === bookingFilter))
    .filter((b) => {
      if (!bookingSearch.trim()) return true;
      const q = bookingSearch.toLowerCase();
      return (
        b.reference_number.toLowerCase().includes(q) ||
        b.event_type.toLowerCase().includes(q) ||
        (b.customer?.full_name || '').toLowerCase().includes(q) ||
        b.event_location.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (bookingSort === 'date_asc') return a.event_date.localeCompare(b.event_date);
      return b.created_at.localeCompare(a.created_at);
    });

  const navLinks: Array<{ id: AdminSection; label: string; icon: typeof BarChart3 }> = [
    { id: 'overview', label: 'Vue d’ensemble', icon: BarChart3 },
    { id: 'bookings', label: 'Réservations', icon: Calendar },
    { id: 'quotes', label: 'Devis', icon: FileText },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon },
    { id: 'customers', label: 'Clients', icon: Users },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#FAF8F4]">
      {/* Sidebar */}
      <aside className="lg:w-64 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-[#E5DFD5] p-4 space-y-6">
        <div className="px-2 pt-2">
          <p className="text-xs font-medium uppercase tracking-widest text-[#8C6F38]">
            Console de gestion
          </p>
          <p className="text-sm font-semibold text-[#1A1917] mt-0.5 truncate">{user.email}</p>
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  section === item.id
                    ? 'bg-[#1A1917] text-[#FAF8F4]'
                    : 'text-[#5C574F] hover:bg-[#F2EFE9] hover:text-[#1A1917]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:block pt-4 border-t border-[#E5DFD5]">
          <button
            type="button"
            onClick={() => setUserSession(null, null)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-[#5C574F] hover:bg-[#F2EFE9] hover:text-[#1A1917] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 p-5 sm:p-8 space-y-6 overflow-x-hidden">
        {actionMsg && (
          <div className="p-3.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-xs font-medium">
            {actionMsg}
          </div>
        )}

        {loadingData && !overview ? (
          <p className="text-sm text-[#5C574F]">Chargement du tableau de bord...</p>
        ) : (
          <>
            {/* OVERVIEW */}
            {section === 'overview' && overview && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
                    Tableau de bord — Casablanca
                  </h1>
                  <p className="text-xs text-[#5C574F]">
                    Synthèse en temps réel des demandes, devis et messages clients.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { label: 'Total réservations', value: overview.stats.total_bookings },
                    { label: 'Nouvelles demandes', value: overview.stats.new_requests },
                    { label: 'Devis en attente', value: overview.stats.pending_quotes },
                    { label: 'Confirmés', value: overview.stats.confirmed_events },
                    { label: 'À venir', value: overview.stats.upcoming_events },
                    { label: 'Clients', value: overview.stats.total_customers },
                    { label: 'Messages non lus', value: overview.stats.unread_messages },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="bg-white border border-[#E5DFD5] rounded-lg p-4 space-y-1"
                    >
                      <p className="text-[11px] text-[#5C574F]">{kpi.label}</p>
                      <p className="font-mono-tabular text-2xl font-semibold text-[#1A1917]">
                        {kpi.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Status Distribution Chart */}
                <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-4">
                  <h2 className="font-serif-display text-xl font-semibold text-[#1A1917]">
                    Répartition des demandes par statut
                  </h2>
                  <div className="space-y-3">
                    {BOOKING_STATUSES.map((st) => {
                      const count = bookings.filter((b) => b.status === st).length;
                      const pct = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
                      return (
                        <div key={st} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#1A1917] font-medium">{st}</span>
                            <span className="font-mono-tabular text-[#5C574F]">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#F2EFE9] overflow-hidden">
                            <div
                              className="h-full bg-[#8C6F38]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-4">
                    <h2 className="font-serif-display text-xl font-semibold text-[#1A1917]">
                      Dernières demandes
                    </h2>
                    {overview.recent_bookings.length === 0 ? (
                      <p className="text-xs text-[#5C574F]">Aucune demande enregistrée.</p>
                    ) : (
                      <div className="divide-y divide-[#F2EFE9] text-xs">
                        {overview.recent_bookings.map((b) => (
                          <div key={b.id} className="py-2.5 flex items-center justify-between gap-2">
                            <div>
                              <p className="font-medium text-[#1A1917]">
                                {b.reference_number} · {b.event_type}
                              </p>
                              <p className="text-[#5C574F]">{formatDateFr(b.event_date)}</p>
                            </div>
                            <span className="font-medium text-[#8C6F38]">{b.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-4">
                    <h2 className="font-serif-display text-xl font-semibold text-[#1A1917]">
                      Messages récents
                    </h2>
                    {overview.recent_messages.length === 0 ? (
                      <p className="text-xs text-[#5C574F]">Aucun message reçu.</p>
                    ) : (
                      <div className="divide-y divide-[#F2EFE9] text-xs">
                        {overview.recent_messages.map((m) => (
                          <div key={m.id} className="py-2.5 space-y-0.5">
                            <p className="font-medium text-[#1A1917]">
                              {m.subject} — {m.name}
                            </p>
                            <p className="text-[#5C574F] truncate">{m.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* BOOKINGS */}
            {section === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
                    Gestion des réservations
                  </h1>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#D5CEC2] bg-white text-xs font-medium text-[#1A1917] hover:border-[#8C6F38] cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exporter CSV</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="search"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Rechercher référence, client, type..."
                    className="px-3.5 py-2 rounded-md border border-[#D5CEC2] bg-white text-xs w-64"
                  />
                  <select
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className="px-3 py-2 rounded-md border border-[#D5CEC2] bg-white text-xs"
                  >
                    <option value="Tous">Tous les statuts</option>
                    {BOOKING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={bookingSort}
                    onChange={(e) => setBookingSort(e.target.value as 'created_desc' | 'date_asc')}
                    className="px-3 py-2 rounded-md border border-[#D5CEC2] bg-white text-xs"
                  >
                    <option value="created_desc">Plus récentes d’abord</option>
                    <option value="date_asc">Date d’événement croissante</option>
                  </select>
                </div>

                <div className="bg-white border border-[#E5DFD5] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F2EFE9] border-b border-[#E5DFD5] text-[#5C574F] uppercase">
                      <tr>
                        <th className="px-4 py-3">Référence</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Événement</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Invités</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EFE9]">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-[#5C574F]">
                            Aucune réservation ne correspond aux critères.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-[#FAF8F4]">
                            <td className="px-4 py-3 font-mono-tabular font-medium text-[#8C6F38]">
                              {b.reference_number}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-[#1A1917]">{b.customer?.full_name || 'Client'}</p>
                              <p className="text-[#5C574F]">{b.customer?.phone}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-[#1A1917]">{b.event_type}</p>
                              <p className="text-[#5C574F]">{b.event_location}</p>
                            </td>
                            <td className="px-4 py-3 font-mono-tabular">{b.event_date}</td>
                            <td className="px-4 py-3 text-right font-mono-tabular">{b.guest_count}</td>
                            <td className="px-4 py-3 font-medium">{b.status}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => setActiveBooking({ ...b })}
                                className="px-3 py-1.5 rounded border border-[#D5CEC2] hover:border-[#8C6F38] font-medium cursor-pointer"
                              >
                                Gérer
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {activeBooking && (
                  <div className="bg-white border border-[#8C6F38] rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                        Dossier {activeBooking.reference_number}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveBooking(null)}
                        className="text-xs text-[#5C574F] underline cursor-pointer"
                      >
                        Fermer
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="font-medium text-[#1A1917]">Statut</label>
                        <select
                          value={activeBooking.status}
                          onChange={(e) => setActiveBooking({ ...activeBooking, status: e.target.value })}
                          className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                        >
                          {BOOKING_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-medium text-[#1A1917]">Date d’événement</label>
                        <input
                          type="date"
                          value={activeBooking.event_date}
                          onChange={(e) => setActiveBooking({ ...activeBooking, event_date: e.target.value })}
                          className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-[#1A1917]">Coordinateur assigné</label>
                        <input
                          type="text"
                          value={activeBooking.assigned_to || ''}
                          onChange={(e) => setActiveBooking({ ...activeBooking, assigned_to: e.target.value })}
                          placeholder="Ex. Équipe Mariages Casablanca"
                          className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="font-medium text-[#1A1917]">Notes internes</label>
                      <textarea
                        rows={3}
                        value={activeBooking.internal_notes || ''}
                        onChange={(e) => setActiveBooking({ ...activeBooking, internal_notes: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleBookingUpdate(activeBooking)}
                        className="px-4 py-2 rounded bg-[#1A1917] text-white text-xs font-medium hover:bg-[#8C6F38] cursor-pointer"
                      >
                        Enregistrer les modifications
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookingUpdate({ ...activeBooking, status: 'Annulé' })}
                        className="px-4 py-2 rounded border border-red-300 text-red-700 text-xs font-medium cursor-pointer"
                      >
                        Annuler la réservation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* QUOTES */}
            {section === 'quotes' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
                    Gestion des devis (MAD)
                  </h1>
                  <button
                    type="button"
                    onClick={() => setShowNewQuote((p) => !p)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#1A1917] text-white text-xs font-medium cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Créer un devis</span>
                  </button>
                </div>

                {showNewQuote && (
                  <form
                    onSubmit={handleCreateQuote}
                    className="bg-white border border-[#E5DFD5] rounded-xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"
                  >
                    <div>
                      <label className="font-medium">Client *</label>
                      <select
                        required
                        value={newQuoteForm.customer_id}
                        onChange={(e) => setNewQuoteForm({ ...newQuoteForm, customer_id: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                      >
                        <option value="">Sélectionner un client...</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.full_name} ({c.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-medium">Type d’événement</label>
                      <input
                        type="text"
                        required
                        value={newQuoteForm.event_type}
                        onChange={(e) => setNewQuoteForm({ ...newQuoteForm, event_type: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                      />
                    </div>
                    <div>
                      <label className="font-medium">Lieu</label>
                      <input
                        type="text"
                        value={newQuoteForm.event_location}
                        onChange={(e) => setNewQuoteForm({ ...newQuoteForm, event_location: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                      />
                    </div>
                    <div className="sm:col-span-3 flex gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-[#8C6F38] text-white font-medium cursor-pointer"
                      >
                        Créer le devis brouillon
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-white border border-[#E5DFD5] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F2EFE9] border-b border-[#E5DFD5] text-[#5C574F] uppercase">
                      <tr>
                        <th className="px-4 py-3">Référence</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Événement</th>
                        <th className="px-4 py-3 text-right">Total (MAD)</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EFE9]">
                      {quotes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-[#5C574F]">
                            Aucun devis enregistré.
                          </td>
                        </tr>
                      ) : (
                        quotes.map((q) => (
                          <tr key={q.id} className="hover:bg-[#FAF8F4]">
                            <td className="px-4 py-3 font-mono-tabular font-medium text-[#8C6F38]">
                              {q.reference_number}
                            </td>
                            <td className="px-4 py-3">{q.customer?.full_name || 'Client'}</td>
                            <td className="px-4 py-3">
                              {q.event_type} · {q.event_location}
                            </td>
                            <td className="px-4 py-3 text-right font-mono-tabular font-medium">
                              {formatMAD(q.total_mad)}
                            </td>
                            <td className="px-4 py-3">{q.status}</td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => setActiveQuote(JSON.parse(JSON.stringify(q)))}
                                className="px-3 py-1.5 rounded border border-[#D5CEC2] hover:border-[#8C6F38] cursor-pointer"
                              >
                                Éditer
                              </button>
                              <button
                                type="button"
                                onClick={() => setPrintableQuote(q)}
                                className="px-3 py-1.5 rounded border border-[#D5CEC2] hover:border-[#8C6F38] cursor-pointer"
                              >
                                Aperçu PDF
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {activeQuote && (
                  <div className="bg-white border border-[#8C6F38] rounded-xl p-6 space-y-5 text-xs">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                        Édition du devis {activeQuote.reference_number}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveQuote(null)}
                        className="text-[#5C574F] underline cursor-pointer"
                      >
                        Fermer
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-medium">Statut du devis</label>
                        <select
                          value={activeQuote.status}
                          onChange={(e) => setActiveQuote({ ...activeQuote, status: e.target.value })}
                          className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                        >
                          {QUOTE_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-medium">Remise (MAD)</label>
                        <input
                          type="number"
                          min={0}
                          value={activeQuote.discount_mad}
                          onChange={(e) =>
                            setActiveQuote({ ...activeQuote, discount_mad: Number(e.target.value) })
                          }
                          className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2] font-mono-tabular"
                        />
                      </div>
                      <div>
                        <label className="font-medium">Date de validité</label>
                        <input
                          type="date"
                          value={activeQuote.valid_until || ''}
                          onChange={(e) => setActiveQuote({ ...activeQuote, valid_until: e.target.value })}
                          className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold uppercase text-[#5C574F]">Lignes de prestations</p>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveQuote({
                              ...activeQuote,
                              items: [
                                ...(activeQuote.items || []),
                                { service_name: '', description: '', quantity: 1, unit_price_mad: 0, line_total_mad: 0 },
                              ],
                            })
                          }
                          className="px-3 py-1.5 rounded border border-[#D5CEC2] font-medium cursor-pointer"
                        >
                          + Ajouter une ligne
                        </button>
                      </div>

                      {(activeQuote.items || []).map((item: QuoteItemRecord, idx: number) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Prestation"
                            value={item.service_name}
                            onChange={(e) => {
                              const items = [...(activeQuote.items || [])];
                              items[idx] = { ...items[idx], service_name: e.target.value };
                              setActiveQuote({ ...activeQuote, items });
                            }}
                            className="sm:col-span-4 px-2.5 py-2 rounded border border-[#D5CEC2]"
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description || ''}
                            onChange={(e) => {
                              const items = [...(activeQuote.items || [])];
                              items[idx] = { ...items[idx], description: e.target.value };
                              setActiveQuote({ ...activeQuote, items });
                            }}
                            className="sm:col-span-3 px-2.5 py-2 rounded border border-[#D5CEC2]"
                          />
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const items = [...(activeQuote.items || [])];
                              items[idx] = { ...items[idx], quantity: Number(e.target.value) };
                              setActiveQuote({ ...activeQuote, items });
                            }}
                            className="sm:col-span-2 px-2.5 py-2 rounded border border-[#D5CEC2] font-mono-tabular"
                          />
                          <input
                            type="number"
                            min={0}
                            value={item.unit_price_mad}
                            onChange={(e) => {
                              const items = [...(activeQuote.items || [])];
                              items[idx] = { ...items[idx], unit_price_mad: Number(e.target.value) };
                              setActiveQuote({ ...activeQuote, items });
                            }}
                            className="sm:col-span-2 px-2.5 py-2 rounded border border-[#D5CEC2] font-mono-tabular"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const items = (activeQuote.items || []).filter((_, i) => i !== idx);
                              setActiveQuote({ ...activeQuote, items });
                            }}
                            className="sm:col-span-1 p-2 text-red-700 cursor-pointer"
                            aria-label="Supprimer la ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="font-medium">Notes administratives</label>
                      <textarea
                        rows={2}
                        value={activeQuote.admin_notes || ''}
                        onChange={(e) => setActiveQuote({ ...activeQuote, admin_notes: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveQuote(activeQuote)}
                      className="px-5 py-2.5 rounded bg-[#1A1917] text-white font-medium hover:bg-[#8C6F38] cursor-pointer"
                    >
                      Enregistrer le devis
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SERVICES */}
            {section === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
                    Gestion des prestations & tarifs (MAD)
                  </h1>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingService({
                        category_id: adminCategories[0]?.id || 'cat_mariages',
                        name_fr: '',
                        short_description_fr: '',
                        description_fr: '',
                        cover_image: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
                        starting_price_mad: null,
                        price_is_example: 0,
                        is_available: 1,
                      })
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1A1917] text-white text-xs font-medium cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouvelle prestation</span>
                  </button>
                </div>

                {editingService && (
                  <form
                    onSubmit={handleSaveService}
                    className="bg-white border border-[#8C6F38] rounded-xl p-6 space-y-4 text-xs"
                  >
                    <h2 className="font-serif-display text-xl font-semibold">
                      {editingService.id ? 'Modifier la prestation' : 'Ajouter une prestation'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium">Nom de la prestation *</label>
                        <input
                          type="text"
                          required
                          value={editingService.name_fr || ''}
                          onChange={(e) => setEditingService({ ...editingService, name_fr: e.target.value })}
                          className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                        />
                      </div>
                      <div>
                        <label className="font-medium">Catégorie</label>
                        <select
                          value={editingService.category_id || ''}
                          onChange={(e) => setEditingService({ ...editingService, category_id: e.target.value })}
                          className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                        >
                          {adminCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name_fr}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-medium">Tarif indicatif dès (MAD) — vide = Tarif sur devis</label>
                        <input
                          type="number"
                          min={0}
                          value={editingService.starting_price_mad ?? ''}
                          onChange={(e) =>
                            setEditingService({
                              ...editingService,
                              starting_price_mad: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2] font-mono-tabular"
                        />
                      </div>
                      <div>
                        <label className="font-medium">URL image de couverture</label>
                        <input
                          type="text"
                          value={editingService.cover_image || ''}
                          onChange={(e) => setEditingService({ ...editingService, cover_image: e.target.value })}
                          className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-medium">Description courte *</label>
                      <input
                        type="text"
                        required
                        value={editingService.short_description_fr || ''}
                        onChange={(e) =>
                          setEditingService({ ...editingService, short_description_fr: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                      />
                    </div>
                    <div>
                      <label className="font-medium">Description détaillée</label>
                      <textarea
                        rows={3}
                        value={editingService.description_fr || ''}
                        onChange={(e) => setEditingService({ ...editingService, description_fr: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(editingService.price_is_example)}
                          onChange={(e) =>
                            setEditingService({ ...editingService, price_is_example: e.target.checked ? 1 : 0 })
                          }
                        />
                        <span>Marquer le prix comme « À titre indicatif »</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingService.is_available !== 0}
                          onChange={(e) =>
                            setEditingService({ ...editingService, is_available: e.target.checked ? 1 : 0 })
                          }
                        />
                        <span>Disponible sur le site</span>
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="px-4 py-2 rounded bg-[#1A1917] text-white cursor-pointer">
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="px-4 py-2 rounded border border-[#D5CEC2] cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminServices.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white border border-[#E5DFD5] rounded-xl p-5 flex justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <h3 className="font-serif-display text-lg font-semibold text-[#1A1917]">
                          {s.name_fr}
                        </h3>
                        <p className="text-[#5C574F]">{s.short_description_fr}</p>
                        <p className="font-mono-tabular text-[#8C6F38]">
                          {s.starting_price_mad !== null && s.starting_price_mad !== undefined
                            ? formatMAD(s.starting_price_mad)
                            : 'Tarif sur devis'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingService({ ...s })}
                          className="px-3 py-1.5 rounded border border-[#D5CEC2] cursor-pointer"
                        >
                          Éditer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(s.id)}
                          className="px-3 py-1.5 rounded border border-red-200 text-red-700 cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GALLERY */}
            {section === 'gallery' && (
              <div className="space-y-6">
                <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
                  Gestion de la galerie (Cloudflare R2)
                </h1>

                <form
                  onSubmit={handleAddGallery}
                  className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-medium">Titre *</label>
                      <input
                        type="text"
                        required
                        value={newGallery.title}
                        onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                      />
                    </div>
                    <div>
                      <label className="font-medium">Catégorie *</label>
                      <select
                        value={newGallery.category}
                        onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                      >
                        {[
                          'Mariages',
                          'Décoration',
                          'Anniversaires',
                          'Événements professionnels',
                          'Traiteur',
                          'Cérémonies marocaines',
                          'Fêtes privées',
                        ].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-medium">Téléverser une image (R2) ou URL</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadR2}
                        className="mt-1 block w-full text-xs"
                      />
                      {uploadingImage && <span className="text-[#8C6F38]">Téléversement...</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="URL image (/api/media/... ou /src/assets/...)"
                      value={newGallery.image_url}
                      onChange={(e) => setNewGallery({ ...newGallery, image_url: e.target.value })}
                      className="px-3 py-2 rounded border border-[#D5CEC2]"
                    />
                    <input
                      type="text"
                      placeholder="Légende descriptive"
                      value={newGallery.caption}
                      onChange={(e) => setNewGallery({ ...newGallery, caption: e.target.value })}
                      className="px-3 py-2 rounded border border-[#D5CEC2]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#1A1917] text-white font-medium cursor-pointer"
                  >
                    Ajouter à la galerie
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {adminGallery.map((img) => (
                    <div key={img.id} className="bg-white border border-[#E5DFD5] rounded-lg overflow-hidden text-xs">
                      <div className="aspect-[4/3] bg-[#F2EFE9]">
                        <SafeImage src={img.image_url} alt={img.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="text-[#8C6F38] font-medium">{img.category}</p>
                        <p className="font-semibold text-[#1A1917]">{img.title}</p>
                        <button
                          type="button"
                          onClick={() => handleDeleteGallery(img.id)}
                          className="text-red-700 underline cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CUSTOMERS */}
            {section === 'customers' && (
              <div className="space-y-6">
                <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
                  Base clients
                </h1>
                <div className="bg-white border border-[#E5DFD5] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F2EFE9] border-b border-[#E5DFD5] text-[#5C574F] uppercase">
                      <tr>
                        <th className="px-4 py-3">Nom complet</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Téléphone</th>
                        <th className="px-4 py-3">Contact préféré</th>
                        <th className="px-4 py-3 text-right">Demandes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EFE9]">
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-[#5C574F]">
                            Aucun client enregistré pour le moment.
                          </td>
                        </tr>
                      ) : (
                        customers.map((c) => (
                          <tr key={c.id}>
                            <td className="px-4 py-3 font-medium text-[#1A1917]">{c.full_name}</td>
                            <td className="px-4 py-3">{c.email}</td>
                            <td className="px-4 py-3 font-mono-tabular">{c.phone}</td>
                            <td className="px-4 py-3 capitalize">{c.preferred_contact}</td>
                            <td className="px-4 py-3 text-right font-mono-tabular">{c.booking_count ?? 0}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {section === 'messages' && (
              <div className="space-y-6">
                <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
                  Messages de contact
                </h1>
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="bg-white border border-[#E5DFD5] rounded-xl p-8 text-center text-xs text-[#5C574F]">
                      Aucun message reçu.
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="bg-white border border-[#E5DFD5] rounded-xl p-5 space-y-3 text-xs">
                        <div className="flex flex-wrap justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm text-[#1A1917]">
                              {m.subject} {!m.is_read && <span className="text-[#8C6F38]">(Non lu)</span>}
                            </p>
                            <p className="text-[#5C574F]">
                              {m.name} · {m.email} · {m.phone}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                await apiFetch(`/api/admin/messages/${m.id}`, {
                                  method: 'PATCH',
                                  body: JSON.stringify({ is_read: !m.is_read }),
                                });
                                await loadAllAdminData();
                              }}
                              className="px-3 py-1.5 rounded border border-[#D5CEC2] cursor-pointer"
                            >
                              {m.is_read ? 'Marquer non lu' : 'Marquer comme lu'}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await apiFetch(`/api/admin/messages/${m.id}`, { method: 'DELETE' });
                                await loadAllAdminData();
                              }}
                              className="px-3 py-1.5 rounded border border-red-200 text-red-700 cursor-pointer"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-[#1A1917]">{m.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {section === 'settings' && settingsForm && (
              <form
                onSubmit={handleSaveSettings}
                className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 max-w-3xl space-y-5 text-xs"
              >
                <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
                  Paramètres de l’agence
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium">Nom de l’entreprise</label>
                    <input
                      type="text"
                      value={settingsForm.company_name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, company_name: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                    />
                  </div>
                  <div>
                    <label className="font-medium">Devise</label>
                    <input
                      type="text"
                      value={settingsForm.currency}
                      onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                    />
                  </div>
                  <div>
                    <label className="font-medium">Téléphone (+212)</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                    />
                  </div>
                  <div>
                    <label className="font-medium">Numéro WhatsApp (format +2126...)</label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp_number || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                      placeholder="+212600000000"
                      className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                    />
                  </div>
                  <div>
                    <label className="font-medium">Email de contact</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                    />
                  </div>
                  <div>
                    <label className="font-medium">Zone d’intervention</label>
                    <input
                      type="text"
                      value={settingsForm.service_area}
                      onChange={(e) => setSettingsForm({ ...settingsForm, service_area: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                    />
                  </div>
                  <div>
                    <label className="font-medium">Instagram URL</label>
                    <input
                      type="url"
                      value={settingsForm.instagram_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                    />
                  </div>
                  <div>
                    <label className="font-medium">Facebook URL</label>
                    <input
                      type="url"
                      value={settingsForm.facebook_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-medium">Slogan</label>
                  <input
                    type="text"
                    value={settingsForm.slogan_fr}
                    onChange={(e) => setSettingsForm({ ...settingsForm, slogan_fr: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                  />
                </div>
                <div>
                  <label className="font-medium">Adresse / Secteur à Casablanca</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                  />
                </div>
                <div>
                  <label className="font-medium">Message d’information réservation</label>
                  <textarea
                    rows={2}
                    value={settingsForm.booking_notice_fr}
                    onChange={(e) => setSettingsForm({ ...settingsForm, booking_notice_fr: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded border border-[#D5CEC2]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded bg-[#1A1917] text-white font-medium hover:bg-[#8C6F38] cursor-pointer"
                >
                  Enregistrer les paramètres
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
