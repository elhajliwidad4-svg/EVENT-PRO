import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, CheckCircle2, FileText, LogOut, User } from 'lucide-react';
import { apiFetch, useAppData } from '../lib/api.ts';
import { formatDateFr, formatMAD } from '../i18n/LanguageContext.tsx';
import type { BookingRecord, NotificationRecord, QuoteRecord } from '../types/index.ts';
import { WhatsAppButton } from '../components/WhatsAppButton.tsx';

export function ClientDashboardPage() {
  const { user, setUserSession } = useAppData();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login');
  const [authForm, setAuthForm] = useState({
    full_name: '',
    email: '',
    phone: '+212 ',
    password: '',
  });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [tab, setTab] = useState<'bookings' | 'quotes' | 'notifications' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    whatsapp: '',
    preferred_contact: 'whatsapp' as 'whatsapp' | 'phone' | 'email',
  });
  const [profileMsg, setProfileMsg] = useState('');

  const loadClientData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [meRes, bRes, qRes, nRes] = await Promise.all([
        apiFetch<{ user: { full_name: string; phone?: string }; customer?: { whatsapp?: string; preferred_contact?: 'whatsapp' | 'phone' | 'email' } }>('/api/client/me'),
        apiFetch<{ bookings: BookingRecord[] }>('/api/client/bookings'),
        apiFetch<{ quotes: QuoteRecord[] }>('/api/client/quotes'),
        apiFetch<{ notifications: NotificationRecord[] }>('/api/client/notifications'),
      ]);
      setBookings(bRes.bookings || []);
      setQuotes(qRes.quotes || []);
      setNotifications(nRes.notifications || []);
      setProfileForm({
        full_name: meRes.user?.full_name || user.full_name,
        phone: meRes.user?.phone || user.phone || '+212 ',
        whatsapp: meRes.customer?.whatsapp || meRes.user?.phone || '+212 ',
        preferred_contact: meRes.customer?.preferred_contact || 'whatsapp',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'client') {
      loadClientData();
    }
  }, [user, loadClientData]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const res = await apiFetch<{ token: string; user: typeof user }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password,
            portal: 'client',
          }),
        });
        setUserSession(res.user, res.token);
      } else if (authMode === 'register') {
        const res = await apiFetch<{ token: string; user: typeof user }>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(authForm),
        });
        setUserSession(res.user, res.token);
      } else {
        const res = await apiFetch<{ message: string }>('/api/auth/recover', {
          method: 'POST',
          body: JSON.stringify({ email: authForm.email }),
        });
        setAuthSuccess(res.message);
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Erreur d’authentification.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      const res = await apiFetch<{ message: string }>('/api/client/me', {
        method: 'PATCH',
        body: JSON.stringify(profileForm),
      });
      setProfileMsg(res.message);
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : 'Erreur de mise à jour.');
    }
  };

  if (!user || user.role !== 'client') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-7 sm:p-9 space-y-6">
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
              Espace Client
            </p>
            <h1 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
              {authMode === 'login'
                ? 'Connexion à votre compte'
                : authMode === 'register'
                  ? 'Créer un compte client'
                  : 'Récupération d’accès'}
            </h1>
            <p className="text-xs text-[#5C574F]">
              Suivez l’avancement de vos demandes d’événements et consultez vos devis en MAD.
            </p>
          </div>

          <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`px-3 py-1.5 rounded cursor-pointer ${
                authMode === 'login' ? 'bg-[#1A1917] text-[#FAF8F4]' : 'text-[#5C574F]'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`px-3 py-1.5 rounded cursor-pointer ${
                authMode === 'register' ? 'bg-[#1A1917] text-[#FAF8F4]' : 'text-[#5C574F]'
              }`}
            >
              Inscription
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('recover');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`px-3 py-1.5 rounded cursor-pointer ${
                authMode === 'recover' ? 'bg-[#1A1917] text-[#FAF8F4]' : 'text-[#5C574F]'
              }`}
            >
              Mot de passe oublié
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-800">
              {authError}
            </div>
          )}
          {authSuccess && (
            <div className="p-3 rounded bg-[#F2EFE9] border border-[#8C6F38]/40 text-xs text-[#1A1917]">
              {authSuccess}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div className="space-y-1">
                  <label htmlFor="cl-name" className="text-xs font-medium text-[#1A1917]">
                    Nom complet *
                  </label>
                  <input
                    id="cl-name"
                    type="text"
                    required
                    value={authForm.full_name}
                    onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="cl-phone" className="text-xs font-medium text-[#1A1917]">
                    Téléphone (+212) *
                  </label>
                  <input
                    id="cl-phone"
                    type="tel"
                    required
                    value={authForm.phone}
                    onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] text-sm"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label htmlFor="cl-email" className="text-xs font-medium text-[#1A1917]">
                Adresse email *
              </label>
              <input
                id="cl-email"
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] text-sm"
              />
            </div>

            {authMode !== 'recover' && (
              <div className="space-y-1">
                <label htmlFor="cl-pass" className="text-xs font-medium text-[#1A1917]">
                  Mot de passe (8+ caractères) *
                </label>
                <input
                  id="cl-pass"
                  type="password"
                  required
                  minLength={8}
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {authLoading
                ? 'Traitement...'
                : authMode === 'login'
                  ? 'Se connecter'
                  : authMode === 'register'
                    ? 'Créer mon compte'
                    : 'Envoyer la demande'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD5] pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#8C6F38]">
            Espace Client Privé
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#1A1917]">
            Bonjour, {user.full_name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/reserver"
            className="px-4 py-2 rounded-md bg-[#1A1917] text-[#FAF8F4] text-xs font-medium hover:bg-[#8C6F38]"
          >
            Nouvelle demande
          </Link>
          <WhatsAppButton label="Contacter l’équipe" variant="outline" />
          <button
            type="button"
            onClick={() => setUserSession(null, null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[#D5CEC2] bg-white text-xs font-medium text-[#5C574F] hover:text-[#1A1917] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'bookings', label: `Mes demandes (${bookings.length})`, icon: Calendar },
          { id: 'quotes', label: `Mes devis (${quotes.length})`, icon: FileText },
          { id: 'notifications', label: `Notifications (${notifications.length})`, icon: Bell },
          { id: 'profile', label: 'Mon profil', icon: User },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as typeof tab)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium border cursor-pointer ${
                tab === item.id
                  ? 'bg-[#1A1917] text-[#FAF8F4] border-[#1A1917]'
                  : 'bg-white border-[#E5DFD5] text-[#5C574F] hover:text-[#1A1917]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {loadingData ? (
        <p className="text-sm text-[#5C574F] py-8">Chargement de votre dossier...</p>
      ) : (
        <>
          {tab === 'bookings' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="bg-white border border-[#E5DFD5] rounded-xl p-10 text-center space-y-3">
                  <p className="text-sm text-[#5C574F]">
                    Vous n’avez pas encore soumis de demande de réservation avec ce compte.
                  </p>
                  <Link
                    to="/reserver"
                    className="inline-block px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-xs font-medium"
                  >
                    Démarrer une demande d’événement
                  </Link>
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-[#E5DFD5] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5C574F]">
                        <span className="font-mono-tabular font-medium text-[#8C6F38]">
                          {b.reference_number}
                        </span>
                        <span>·</span>
                        <span>{formatDateFr(b.event_date)}</span>
                        <span>·</span>
                        <span className="font-semibold text-[#1A1917]">Statut : {b.status}</span>
                      </div>
                      <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                        {b.event_title || b.event_type}
                      </h2>
                      <p className="text-xs text-[#5C574F]">
                        {b.event_location} · {b.guest_count} invités · Budget : {b.budget_range}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedBooking(selectedBooking?.id === b.id ? null : b)}
                      className="px-4 py-2 rounded-md border border-[#D5CEC2] text-xs font-medium text-[#1A1917] hover:border-[#8C6F38] shrink-0 cursor-pointer"
                    >
                      {selectedBooking?.id === b.id ? 'Masquer les détails' : 'Voir les détails'}
                    </button>
                  </div>
                ))
              )}

              {selectedBooking && (
                <div className="bg-[#F2EFE9] border border-[#D5CEC2] rounded-xl p-6 space-y-3 text-sm">
                  <h3 className="font-serif-display text-xl font-semibold text-[#1A1917]">
                    Détails — {selectedBooking.reference_number}
                  </h3>
                  <p>
                    <strong>Créneau :</strong> {selectedBooking.preferred_time} ({selectedBooking.duration_hours}h)
                  </p>
                  <p>
                    <strong>Style :</strong> {selectedBooking.preferred_style || 'Non précisé'} ·{' '}
                    {selectedBooking.color_theme || ''}
                  </p>
                  {selectedBooking.services && selectedBooking.services.length > 0 && (
                    <div>
                      <strong>Prestations demandées :</strong>
                      <ul className="list-disc pl-5 mt-1 text-xs space-y-1">
                        {selectedBooking.services.map((s) => (
                          <li key={s.id}>{s.service_name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'quotes' && (
            <div className="space-y-4">
              {quotes.length === 0 ? (
                <div className="bg-white border border-[#E5DFD5] rounded-xl p-10 text-center space-y-3">
                  <p className="text-sm text-[#5C574F]">Aucun devis enregistré pour ce compte.</p>
                  <Link
                    to="/devis"
                    className="inline-block px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-xs font-medium"
                  >
                    Demander un devis personnalisé
                  </Link>
                </div>
              ) : (
                quotes.map((q) => (
                  <div key={q.id} className="bg-white border border-[#E5DFD5] rounded-xl p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-mono-tabular text-xs text-[#8C6F38]">{q.reference_number}</p>
                        <h3 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                          {q.event_type} — {q.event_location}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[#1A1917]">Statut : {q.status}</p>
                        <p className="font-mono-tabular text-lg font-semibold text-[#8C6F38]">
                          {q.total_mad > 0 ? formatMAD(q.total_mad) : 'Chiffrage en cours'}
                        </p>
                      </div>
                    </div>

                    {q.items && q.items.length > 0 && (
                      <div className="border-t border-[#F2EFE9] pt-3 space-y-1.5 text-xs">
                        {q.items.map((it, i) => (
                          <div key={i} className="flex justify-between gap-4">
                            <span>
                              {it.service_name} (×{it.quantity})
                            </span>
                            <span className="font-mono-tabular">
                              {it.line_total_mad > 0 ? formatMAD(it.line_total_mad) : 'À chiffrer'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-white border border-[#E5DFD5] rounded-xl divide-y divide-[#F2EFE9]">
              {notifications.length === 0 ? (
                <p className="p-8 text-center text-sm text-[#5C574F]">Aucune notification pour le moment.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-5 space-y-1">
                    <p className="text-sm font-medium text-[#1A1917]">{n.title}</p>
                    <p className="text-xs text-[#5C574F]">{n.body}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'profile' && (
            <form
              onSubmit={handleProfileSave}
              className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-8 max-w-xl space-y-4"
            >
              <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                Mettre à jour vos coordonnées
              </h2>
              {profileMsg && (
                <div className="p-3 rounded bg-[#F2EFE9] text-xs text-[#1A1917] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8C6F38]" />
                  <span>{profileMsg}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1917]">Nom complet</label>
                <input
                  type="text"
                  required
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1917]">Téléphone</label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1917]">WhatsApp</label>
                <input
                  type="tel"
                  value={profileForm.whatsapp}
                  onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-xs font-medium hover:bg-[#8C6F38] cursor-pointer"
              >
                Enregistrer
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
