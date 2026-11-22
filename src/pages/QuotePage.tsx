import React, { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, CheckCircle2 } from 'lucide-react';
import { apiFetch, useAppData } from '../lib/api.ts';
import { TurnstileWidget } from '../components/ui/TurnstileWidget.tsx';
import { WhatsAppButton } from '../components/WhatsAppButton.tsx';

const QUOTE_SERVICE_CHOICES = [
  'Organisation complète',
  'Décoration & fleurs',
  'Traiteur & buffet',
  'Location de salle',
  'Photographie & vidéo',
  'Sonorisation & éclairage',
  'DJ & animation',
  'Mobilier & équipements',
];

export function QuotePage() {
  const { user } = useAppData();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('service');

  const [form, setForm] = useState({
    event_type: 'Mariage',
    event_date: '',
    event_location: 'Casablanca',
    guest_count: 100,
    budget_range: '20 000 à 50 000 MAD',
    details: '',
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '+212 ',
  });

  const [requestedServices, setRequestedServices] = useState<string[]>(
    preselected ? [preselected] : ['Organisation complète', 'Décoration & fleurs']
  );
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ reference_number: string; message: string } | null>(null);

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const toggleService = (name: string) => {
    setRequestedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim() || !form.email.trim() || !form.event_location.trim()) {
      setError('Veuillez remplir les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{ reference_number: string; message: string }>('/api/public/quotes', {
        method: 'POST',
        body: JSON.stringify({ ...form, requested_services: requestedServices, turnstileToken }),
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la demande de devis.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-8 sm:p-12 text-center space-y-5">
          <CheckCircle2 className="w-10 h-10 text-[#8C6F38] mx-auto" />
          <p className="font-mono-tabular text-xs uppercase tracking-widest text-[#8C6F38]">
            Référence devis : {result.reference_number}
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#1A1917]">
            Demande de devis envoyée
          </h1>
          <p className="text-sm text-[#5C574F] max-w-lg mx-auto leading-relaxed">
            {result.message} Nos conseillers à Casablanca préparent votre chiffrage détaillé en MAD.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <Link
              to="/espace-client"
              className="px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium"
            >
              Voir mes devis
            </Link>
            <WhatsAppButton
              label="Demander un devis via WhatsApp"
              contextLabel={`Devis ${result.reference_number}`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
            Estimation personnalisée · MAD
          </p>
          <h1 className="font-serif-display text-4xl font-semibold text-[#1A1917]">
            Demander un devis sur mesure
          </h1>
          <p className="text-sm text-[#5C574F]">
            Recevez une proposition chiffrée poste par poste adaptée à votre événement à Casablanca.
          </p>
        </div>
        <WhatsAppButton label="Devis rapide via WhatsApp" contextLabel="Demande de devis" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-9 space-y-6"
      >
        {error && (
          <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="qt-type" className="text-xs font-medium text-[#1A1917]">
              Type d’événement *
            </label>
            <select
              id="qt-type"
              value={form.event_type}
              onChange={(e) => setForm({ ...form, event_type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
            >
              <option value="Mariage">Mariage</option>
              <option value="Fiançailles">Fiançailles</option>
              <option value="Cérémonie marocaine / Henné">Cérémonie marocaine / Henné</option>
              <option value="Anniversaire">Anniversaire</option>
              <option value="Événement professionnel">Événement professionnel</option>
              <option value="Fête privée">Fête privée</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="qt-date" className="text-xs font-medium text-[#1A1917]">
              Date souhaitée
            </label>
            <input
              id="qt-date"
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="qt-loc" className="text-xs font-medium text-[#1A1917]">
              Lieu / Ville *
            </label>
            <input
              id="qt-loc"
              type="text"
              required
              value={form.event_location}
              onChange={(e) => setForm({ ...form, event_location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="qt-guests" className="text-xs font-medium text-[#1A1917]">
              Nombre d’invités *
            </label>
            <input
              id="qt-guests"
              type="number"
              min={1}
              value={form.guest_count}
              onChange={(e) => setForm({ ...form, guest_count: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm font-mono-tabular"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="qt-budget" className="text-xs font-medium text-[#1A1917]">
              Budget indicatif (MAD)
            </label>
            <select
              id="qt-budget"
              value={form.budget_range}
              onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
            >
              <option value="Moins de 5 000 MAD">Moins de 5 000 MAD</option>
              <option value="5 000 à 10 000 MAD">5 000 à 10 000 MAD</option>
              <option value="10 000 à 20 000 MAD">10 000 à 20 000 MAD</option>
              <option value="20 000 à 50 000 MAD">20 000 à 50 000 MAD</option>
              <option value="Plus de 50 000 MAD">Plus de 50 000 MAD</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[#1A1917]">Prestations souhaitées</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {QUOTE_SERVICE_CHOICES.map((srv) => {
              const active = requestedServices.includes(srv);
              return (
                <button
                  key={srv}
                  type="button"
                  onClick={() => toggleService(srv)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md border text-xs font-medium text-left cursor-pointer ${
                    active
                      ? 'bg-[#1A1917] text-[#FAF8F4] border-[#1A1917]'
                      : 'bg-white border-[#D5CEC2] text-[#1A1917]'
                  }`}
                >
                  <span className="truncate">{srv}</span>
                  {active && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="qt-details" className="text-xs font-medium text-[#1A1917]">
            Détails du projet
          </label>
          <textarea
            id="qt-details"
            rows={4}
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            placeholder="Ambiance souhaitée, configuration de salle, préférences gastronomiques..."
            className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F2EFE9]">
          <div className="space-y-1.5">
            <label htmlFor="qt-name" className="text-xs font-medium text-[#1A1917]">
              Nom complet *
            </label>
            <input
              id="qt-name"
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="qt-email" className="text-xs font-medium text-[#1A1917]">
              Email *
            </label>
            <input
              id="qt-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="qt-phone" className="text-xs font-medium text-[#1A1917]">
              Téléphone (+212) *
            </label>
            <input
              id="qt-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm"
            />
          </div>
        </div>

        <TurnstileWidget onVerify={handleVerify} />

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Enregistrement...' : 'Envoyer la demande de devis'}
        </button>
      </form>
    </div>
  );
}
