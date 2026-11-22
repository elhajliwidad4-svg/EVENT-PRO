import React, { useCallback, useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { apiFetch, useAppData } from '../lib/api.ts';
import { WhatsAppButton } from '../components/WhatsAppButton.tsx';
import { TurnstileWidget } from '../components/ui/TurnstileWidget.tsx';
import { TextReveal } from '../components/ui/TextReveal.tsx';

export function ContactPage() {
  const { settings } = useAppData();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+212 ',
    subject: '',
    message: '',
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<{ message: string }>('/api/public/contact', {
        method: 'POST',
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      setSuccess(res.message);
      setForm({ name: '', email: '', phone: '+212 ', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’envoi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
          Contact · Casablanca
        </p>
        <TextReveal
          as="h1"
          immediate
          text="Parlons de votre prochain événement"
          className="font-serif-display text-4xl sm:text-5xl font-semibold"
        />
        <p className="text-base text-[#5C574F] leading-relaxed">
          Une question sur nos disponibilités, un repérage de lieu à Casablanca ou un besoin spécifique ? Écrivez-nous directement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Details & Casablanca Service Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E5DFD5] rounded-xl p-7 space-y-5">
            <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
              Coordonnées directes
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#8C6F38] mt-1 shrink-0" />
                <div>
                  <p className="font-medium text-[#1A1917]">Téléphone</p>
                  <p className="text-[#5C574F] font-mono-tabular">{settings.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#8C6F38] mt-1 shrink-0" />
                <div>
                  <p className="font-medium text-[#1A1917]">Email</p>
                  <p className="text-[#5C574F]">{settings.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#8C6F38] mt-1 shrink-0" />
                <div>
                  <p className="font-medium text-[#1A1917]">Zone d’intervention</p>
                  <p className="text-[#5C574F]">{settings.address}</p>
                  <p className="text-xs text-[#8C6F38] mt-1">{settings.service_area}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F2EFE9] flex flex-wrap gap-3">
              <WhatsAppButton label="Contactez-nous sur WhatsApp" variant="primary" />
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs font-medium text-[#5C574F]">
              <a
                href={settings.instagram_url || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#1A1917] underline underline-offset-4"
              >
                Instagram
              </a>
              <a
                href={settings.facebook_url || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#1A1917] underline underline-offset-4"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Google Maps Placeholder */}
          <div className="bg-[#F2EFE9] border border-[#E5DFD5] rounded-xl p-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8C6F38]">
              Carte & Zone Casablanca
            </p>
            <h3 className="font-serif-display text-xl font-semibold text-[#1A1917]">
              Grand Casablanca (Anfa · Ain Diab · Bouskoura · Dar Bouazza)
            </h3>
            <p className="text-xs text-[#5C574F] leading-relaxed">
              Emplacement de carte Google Maps prêt pour intégration de votre adresse exacte ou point de rendez-vous showroom.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border border-[#E5DFD5] rounded-xl p-7 sm:p-9">
          <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917] mb-6">
            Envoyer un message
          </h2>

          {success ? (
            <div className="bg-[#F2EFE9] border border-[#8C6F38]/40 rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#1A1917] font-semibold">
                <CheckCircle2 className="w-5 h-5 text-[#8C6F38]" />
                <span>Message envoyé</span>
              </div>
              <p className="text-sm text-[#5C574F]">{success}</p>
              <button
                type="button"
                onClick={() => setSuccess('')}
                className="text-xs font-medium text-[#8C6F38] underline cursor-pointer"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-xs font-medium text-[#1A1917]">
                    Nom complet *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex. Nadia El Amrani"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm focus:outline-none focus:border-[#8C6F38]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="text-xs font-medium text-[#1A1917]">
                    Téléphone (+212) *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+212 6 00 00 00 00"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm focus:outline-none focus:border-[#8C6F38]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-medium text-[#1A1917]">
                    Adresse email *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nom@exemple.ma"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm focus:outline-none focus:border-[#8C6F38]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-subject" className="text-xs font-medium text-[#1A1917]">
                    Objet *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Renseignement mariage, séminaire..."
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm focus:outline-none focus:border-[#8C6F38]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-medium text-[#1A1917]">
                  Votre message *
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Décrivez votre projet, la date envisagée et vos attentes..."
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm focus:outline-none focus:border-[#8C6F38]"
                />
              </div>

              <TurnstileWidget onVerify={handleVerify} />

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
