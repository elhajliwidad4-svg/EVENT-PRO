import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from 'lucide-react';
import { apiFetch, useAppData } from '../lib/api.ts';
import { formatDateFr } from '../i18n/LanguageContext.tsx';
import { TurnstileWidget } from '../components/ui/TurnstileWidget.tsx';
import { WhatsAppButton } from '../components/WhatsAppButton.tsx';

const EVENT_TYPES = [
  'Mariage',
  'Fiançailles',
  'Cérémonie du henné / Marocaine',
  'Anniversaire',
  'Événement professionnel / Séminaire',
  'Conférence / Lancement',
  'Team building',
  'Baby shower / Remise de diplôme',
  'Fête privée',
];

const VENUE_OPTIONS = [
  'Lieu déjà réservé par nos soins',
  'Recherche de villa / jardin à Anfa ou Bouskoura',
  'Recherche de salle de réception à Casablanca',
  'Domicile privé / Terrasse',
  'Hôtel ou centre de conférences',
  'À définir avec EVENT PRO',
];

const SERVICE_OPTIONS_CATALOG: Array<{ name: string; options: string[] }> = [
  { name: 'Décoration', options: ['Scénographie complète', 'Arche cérémonielle', 'Tables d’honneur'] },
  { name: 'Traiteur', options: ['Dîner assis', 'Buffet gastronomique', 'Cocktail dînatoire', 'Pâtisseries marocaines'] },
  { name: 'Photographie', options: ['Couverture complète', 'Préparatifs + réception', 'Album imprimé'] },
  { name: 'Vidéographie', options: ['Film 4K', 'Teaser court', 'Prises drone'] },
  { name: 'DJ', options: ['DJ généraliste', 'DJ oriental & international'] },
  { name: 'Sonorisation', options: ['Sonorisation salle', 'Micros sans fil conférence'] },
  { name: 'Éclairage', options: ['Éclairage architectural chaud', 'Jeux de lumière soirée'] },
  { name: 'Lieu / Salle', options: ['Repérage & visites', 'Tente ou structure extérieure'] },
  { name: 'Mobilier', options: ['Tables & chaises banquet', 'Salons marocains / Lounge', 'Nappage lin'] },
  { name: 'Fleurs', options: ['Fleurs fraîches de saison', 'Centres de table hauts', 'Bouquet de mariée'] },
  { name: 'Animation', options: ['Orchestre / Issawa / Dakka', 'Saxophoniste ou violoniste', 'Hôtesses d’accueil'] },
  { name: 'Autre', options: ['Papeterie & menus', 'Service voiturier'] },
];

const BUDGET_RANGES = [
  'Moins de 5 000 MAD',
  '5 000 à 10 000 MAD',
  '10 000 à 20 000 MAD',
  '20 000 à 50 000 MAD',
  'Plus de 50 000 MAD',
  'Budget personnalisé',
];

const STYLES = [
  'Luxe contemporain & épuré',
  'Traditionnel marocain raffiné',
  'Jardin botanique & naturel',
  'Classique intemporel (ivoire & or)',
  'Corporate sobre & institutionnel',
];

export function BookingPage() {
  const { user, settings } = useAppData();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [confirmation, setConfirmation] = useState<{
    reference_number: string;
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
    event_type: searchParams.get('type') || 'Mariage',
    event_title: '',
    event_date: '',
    preferred_time: 'Soirée (à partir de 19h00)',
    event_location: 'Casablanca',
    venue_preference: 'À définir avec EVENT PRO',
    guest_count: 80,
    duration_hours: 6,
    budget_range: '20 000 à 50 000 MAD',
    custom_budget_mad: '',
    preferred_style: 'Classique intemporel (ivoire & or)',
    color_theme: 'Ivoire, sable et doré champagne',
    special_requirements: '',
    additional_notes: '',
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '+212 ',
    whatsapp: user?.phone || '+212 ',
    preferred_contact: 'whatsapp' as 'whatsapp' | 'phone' | 'email',
  });

  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>(() => {
    const pre = searchParams.get('service');
    if (pre) {
      return { [pre]: [] };
    }
    return { Décoration: ['Scénographie complète'] };
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        full_name: prev.full_name || user.full_name,
        email: prev.email || user.email,
        phone: prev.phone === '+212 ' && user.phone ? user.phone : prev.phone,
        whatsapp: prev.whatsapp === '+212 ' && user.phone ? user.phone : prev.whatsapp,
      }));
    }
  }, [user]);

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const toggleService = (name: string) => {
    setSelectedServices((prev) => {
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      } else {
        next[name] = [];
      }
      return next;
    });
  };

  const toggleOption = (serviceName: string, option: string) => {
    setSelectedServices((prev) => {
      const current = prev[serviceName] || [];
      const exists = current.includes(option);
      return {
        ...prev,
        [serviceName]: exists ? current.filter((o) => o !== option) : [...current, option],
      };
    });
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');
    if (currentStep === 1) {
      if (!form.event_type || !form.event_date || !form.event_location.trim()) {
        setError('Veuillez renseigner le type d’événement, la date souhaitée et le lieu à Casablanca.');
        return false;
      }
      if (!form.guest_count || form.guest_count < 1) {
        setError('Veuillez indiquer un nombre d’invités valide.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (Object.keys(selectedServices).length === 0) {
        setError('Sélectionnez au moins une prestation pour orienter notre équipe.');
        return false;
      }
    }
    if (currentStep === 3) {
      if (form.budget_range === 'Budget personnalisé' && !form.custom_budget_mad) {
        setError('Veuillez préciser votre enveloppe budgétaire estimée en MAD.');
        return false;
      }
    }
    if (currentStep === 4) {
      if (!form.full_name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
        setError('Veuillez saisir votre nom complet et une adresse email valide.');
        return false;
      }
      if (form.phone.replace(/[^0-9]/g, '').length < 8) {
        setError('Veuillez indiquer un numéro de téléphone valide (+212).');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(5, s + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        custom_budget_mad: form.custom_budget_mad ? Number(form.custom_budget_mad) : null,
        selected_services: Object.entries(selectedServices).map(([service_name, options]) => ({
          service_name,
          options,
        })),
        turnstileToken,
      };
      const res = await apiFetch<{ reference_number: string; message: string }>('/api/public/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setConfirmation(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’envoi de votre demande.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-8 sm:p-12 space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#F2EFE9] text-[#8C6F38] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs font-mono-tabular uppercase tracking-widest text-[#8C6F38]">
            Référence : {confirmation.reference_number}
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#1A1917]">
            Demande de réservation enregistrée
          </h1>
          <p className="text-base text-[#1A1917] max-w-xl mx-auto leading-relaxed">
            {confirmation.message}
          </p>
          <p className="text-xs text-[#5C574F] max-w-lg mx-auto">
            Cette demande reste en statut « Nouvelle demande » jusqu’à validation finale et acceptation du devis personnalisé avec notre équipe à Casablanca.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/espace-client"
              className="px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors"
            >
              Suivre dans l’espace client
            </Link>
            <WhatsAppButton
              label="Confirmer l’échange sur WhatsApp"
              contextLabel={`Demande ${confirmation.reference_number} (${form.event_type})`}
            />
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = [
    '1. Événement',
    '2. Prestations',
    '3. Budget & style',
    '4. Coordonnées',
    '5. Récapitulatif',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
          Réservation sur mesure · Casablanca
        </p>
        <h1 className="font-serif-display text-4xl font-semibold text-[#1A1917]">
          Organiser votre événement
        </h1>
        <p className="text-sm text-[#5C574F]">{settings.booking_notice_fr}</p>
      </div>

      {/* Stepper Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {stepLabels.map((label, idx) => {
          const num = idx + 1;
          const active = step === num;
          const done = step > num;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (num < step) setStep(num);
              }}
              disabled={num > step}
              className={`px-3 py-2.5 rounded-md text-xs font-medium text-left border transition-colors ${
                active
                  ? 'bg-[#1A1917] text-[#FAF8F4] border-[#1A1917]'
                  : done
                    ? 'bg-[#F2EFE9] text-[#1A1917] border-[#D5CEC2] cursor-pointer'
                    : 'bg-white text-[#8D867B] border-[#E5DFD5] cursor-not-allowed'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-9 space-y-6">
        {error && (
          <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Step 1: Event Information */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
              Informations générales sur l’événement
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="bk-type" className="text-xs font-medium text-[#1A1917]">
                  Type d’événement *
                </label>
                <select
                  id="bk-type"
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bk-title" className="text-xs font-medium text-[#1A1917]">
                  Titre ou intitulé du projet
                </label>
                <input
                  id="bk-title"
                  type="text"
                  value={form.event_title}
                  onChange={(e) => setForm({ ...form, event_title: e.target.value })}
                  placeholder="Ex. Mariage Salma & Karim, Séminaire Annuel..."
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="bk-date" className="text-xs font-medium text-[#1A1917]">
                  Date souhaitée *
                </label>
                <input
                  id="bk-date"
                  type="date"
                  required
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bk-time" className="text-xs font-medium text-[#1A1917]">
                  Créneau horaire préféré
                </label>
                <select
                  id="bk-time"
                  value={form.preferred_time}
                  onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                >
                  <option value="Matinée (09h00 – 13h00)">Matinée (09h00 – 13h00)</option>
                  <option value="Après-midi (14h00 – 18h30)">Après-midi (14h00 – 18h30)</option>
                  <option value="Soirée (à partir de 19h00)">Soirée (à partir de 19h00)</option>
                  <option value="Journée complète">Journée complète</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="bk-location" className="text-xs font-medium text-[#1A1917]">
                  Ville / Quartier *
                </label>
                <input
                  id="bk-location"
                  type="text"
                  required
                  value={form.event_location}
                  onChange={(e) => setForm({ ...form, event_location: e.target.value })}
                  placeholder="Casablanca (Anfa, Bouskoura, Ain Diab...)"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bk-venue" className="text-xs font-medium text-[#1A1917]">
                  Lieu / Salle de réception
                </label>
                <select
                  id="bk-venue"
                  value={form.venue_preference}
                  onChange={(e) => setForm({ ...form, venue_preference: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                >
                  {VENUE_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="bk-guests" className="text-xs font-medium text-[#1A1917]">
                  Nombre estimé d’invités *
                </label>
                <input
                  id="bk-guests"
                  type="number"
                  min={1}
                  max={10000}
                  value={form.guest_count}
                  onChange={(e) => setForm({ ...form, guest_count: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm font-mono-tabular"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bk-duration" className="text-xs font-medium text-[#1A1917]">
                  Durée estimée (heures)
                </label>
                <input
                  id="bk-duration"
                  type="number"
                  min={1}
                  max={72}
                  value={form.duration_hours}
                  onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm font-mono-tabular"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services Selection */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                Sélection des prestations souhaitées
              </h2>
              <p className="text-sm text-[#5C574F] mt-1">
                Cochez un ou plusieurs pôles puis précisez les options qui vous intéressent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICE_OPTIONS_CATALOG.map((srv) => {
                const isSelected = Boolean(selectedServices[srv.name]);
                const chosenOpts = selectedServices[srv.name] || [];
                return (
                  <div
                    key={srv.name}
                    className={`border rounded-lg p-4 transition-colors ${
                      isSelected ? 'border-[#8C6F38] bg-[#FAF8F4]' : 'border-[#E5DFD5] bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleService(srv.name)}
                      className="w-full flex items-center justify-between text-left cursor-pointer"
                    >
                      <span className="font-medium text-sm text-[#1A1917]">{srv.name}</span>
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isSelected
                            ? 'bg-[#1A1917] border-[#1A1917] text-white'
                            : 'border-[#D5CEC2] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </button>

                    {isSelected && srv.options.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#E5DFD5] flex flex-wrap gap-2">
                        {srv.options.map((opt) => {
                          const activeOpt = chosenOpts.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleOption(srv.name, opt)}
                              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                                activeOpt
                                  ? 'bg-[#8C6F38] text-white'
                                  : 'bg-white border border-[#D5CEC2] text-[#5C574F] hover:text-[#1A1917]'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Budget and Customization */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
              Budget & personnalisation artistique
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#1A1917]">
                Fourchette budgétaire estimée (MAD) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {BUDGET_RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setForm({ ...form, budget_range: range })}
                    className={`px-4 py-3 rounded-md border text-xs font-medium text-left transition-colors cursor-pointer ${
                      form.budget_range === range
                        ? 'bg-[#1A1917] text-[#FAF8F4] border-[#1A1917]'
                        : 'bg-white border-[#D5CEC2] text-[#1A1917] hover:border-[#8C6F38]'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {form.budget_range === 'Budget personnalisé' && (
              <div className="space-y-1.5">
                <label htmlFor="bk-custom-budget" className="text-xs font-medium text-[#1A1917]">
                  Montant estimé (MAD) *
                </label>
                <input
                  id="bk-custom-budget"
                  type="number"
                  min={1000}
                  value={form.custom_budget_mad}
                  onChange={(e) => setForm({ ...form, custom_budget_mad: e.target.value })}
                  placeholder="Ex. 75000"
                  className="w-full sm:w-64 px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm font-mono-tabular"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="bk-style" className="text-xs font-medium text-[#1A1917]">
                  Style souhaité
                </label>
                <select
                  id="bk-style"
                  value={form.preferred_style}
                  onChange={(e) => setForm({ ...form, preferred_style: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                >
                  {STYLES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bk-colors" className="text-xs font-medium text-[#1A1917]">
                  Palette de couleurs
                </label>
                <input
                  id="bk-colors"
                  type="text"
                  value={form.color_theme}
                  onChange={(e) => setForm({ ...form, color_theme: e.target.value })}
                  placeholder="Ex. Ivoire, vert sauge, doré"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bk-req" className="text-xs font-medium text-[#1A1917]">
                Exigences particulières (accessibilité, préférences culinaires, protocole...)
              </label>
              <textarea
                id="bk-req"
                rows={3}
                value={form.special_requirements}
                onChange={(e) => setForm({ ...form, special_requirements: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bk-notes" className="text-xs font-medium text-[#1A1917]">
                Notes complémentaires
              </label>
              <textarea
                id="bk-notes"
                rows={3}
                value={form.additional_notes}
                onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 4: Client Details */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
              Vos coordonnées de contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="bk-name" className="text-xs font-medium text-[#1A1917]">
                  Nom complet *
                </label>
                <input
                  id="bk-name"
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Nom et prénom"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bk-email" className="text-xs font-medium text-[#1A1917]">
                  Adresse email *
                </label>
                <input
                  id="bk-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="nom@exemple.ma"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="bk-phone" className="text-xs font-medium text-[#1A1917]">
                  Numéro de téléphone (+212) *
                </label>
                <input
                  id="bk-phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+212 6 00 00 00 00"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="bk-wa" className="text-xs font-medium text-[#1A1917]">
                  Numéro WhatsApp
                </label>
                <input
                  id="bk-wa"
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+212 6 00 00 00 00"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#1A1917]">
                Moyen de contact privilégié
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'phone', label: 'Appel téléphonique' },
                  { id: 'email', label: 'Email' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, preferred_contact: opt.id as 'whatsapp' | 'phone' | 'email' })
                    }
                    className={`px-4 py-2 rounded-md border text-xs font-medium cursor-pointer ${
                      form.preferred_contact === opt.id
                        ? 'bg-[#1A1917] text-[#FAF8F4] border-[#1A1917]'
                        : 'bg-white border-[#D5CEC2] text-[#1A1917]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Summary and Confirmation */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
              Récapitulatif de votre demande
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF8F4] border border-[#E5DFD5] rounded-lg p-5 text-sm">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6F38]">
                  Événement
                </p>
                <p>
                  <span className="text-[#5C574F]">Type :</span> <strong>{form.event_type}</strong>
                </p>
                <p>
                  <span className="text-[#5C574F]">Date :</span>{' '}
                  <strong>{formatDateFr(form.event_date)}</strong> ({form.preferred_time})
                </p>
                <p>
                  <span className="text-[#5C574F]">Lieu :</span> {form.event_location}
                </p>
                <p>
                  <span className="text-[#5C574F]">Salle :</span> {form.venue_preference}
                </p>
                <p>
                  <span className="text-[#5C574F]">Convives :</span>{' '}
                  <span className="font-mono-tabular">{form.guest_count}</span> personnes ·{' '}
                  <span className="font-mono-tabular">{form.duration_hours}</span>h
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6F38]">
                  Budget & Client
                </p>
                <p>
                  <span className="text-[#5C574F]">Budget :</span>{' '}
                  <strong>
                    {form.budget_range === 'Budget personnalisé'
                      ? `${form.custom_budget_mad} MAD`
                      : form.budget_range}
                  </strong>
                </p>
                <p>
                  <span className="text-[#5C574F]">Style :</span> {form.preferred_style}
                </p>
                <p>
                  <span className="text-[#5C574F]">Contact :</span> {form.full_name}
                </p>
                <p>
                  <span className="text-[#5C574F]">Téléphone :</span> {form.phone}
                </p>
                <p>
                  <span className="text-[#5C574F]">Email :</span> {form.email}
                </p>
              </div>

              <div className="sm:col-span-2 pt-3 border-t border-[#E5DFD5] space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6F38]">
                  Prestations sélectionnées
                </p>
                <ul className="space-y-1 text-xs text-[#1A1917]">
                  {Object.entries(selectedServices).map(([srv, opts]) => (
                    <li key={srv}>
                      <strong>{srv}</strong>
                      {opts.length > 0 ? ` — ${opts.join(', ')}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <TurnstileWidget onVerify={handleVerify} />

            <p className="text-xs text-[#5C574F]">
              En envoyant ce formulaire, votre demande est enregistrée pour étude. Elle ne constitue pas une confirmation ferme avant validation de votre devis avec EVENT PRO.
            </p>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setError('');
                setStep((s) => s - 1);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm font-medium text-[#1A1917] hover:border-[#8C6F38] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
          ) : (
            <span />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors cursor-pointer"
            >
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#8C6F38] text-white text-sm font-semibold hover:bg-[#735A2B] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
