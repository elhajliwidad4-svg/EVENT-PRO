import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useAppData } from '../lib/api.ts';
import { formatMAD, useLanguage } from '../i18n/LanguageContext.tsx';
import { SafeImage } from '../components/ui/SafeImage.tsx';
import { TextReveal } from '../components/ui/TextReveal.tsx';
import { WhatsAppButton } from '../components/WhatsAppButton.tsx';

function parseStringArray(jsonStr: string): string[] {
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function ServicesPage({ mode = 'services' }: { mode?: 'services' | 'events' }) {
  const { categories, services, loading } = useAppData();
  const { locale, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category_id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
          {mode === 'events' ? 'Formats d’événements · Casablanca' : 'Catalogue des prestations'}
        </p>
        <TextReveal
          as="h1"
          immediate
          text={
            mode === 'events'
              ? 'Chaque célébration mérite une mise en scène dédiée'
              : 'Nos services d’organisation et de scénographie'
          }
          className="font-serif-display text-4xl sm:text-5xl font-semibold [text-wrap:balance]"
        />
        <p className="text-base text-[#5C574F] leading-relaxed">
          Découvrez l’ensemble de nos pôles d’expertise à Casablanca. Tous nos tarifs sont établis en MAD selon la jauge, le lieu et le niveau de personnalisation souhaités.
        </p>
      </div>

      {/* Interactive Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DFD5] pb-4">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#1A1917] text-[#FAF8F4]'
              : 'bg-white border border-[#E5DFD5] text-[#5C574F] hover:text-[#1A1917]'
          }`}
        >
          Toutes les prestations
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#1A1917] text-[#FAF8F4]'
                : 'bg-white border border-[#E5DFD5] text-[#5C574F] hover:text-[#1A1917]'
            }`}
          >
            {locale === 'ar' && cat.name_ar ? cat.name_ar : cat.name_fr}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[#5C574F]">{t.common.loading}</div>
      ) : (
        <div className="space-y-10">
          {filteredServices.map((srv, idx) => {
            const benefits = parseStringArray(srv.benefits_json);
            const included = parseStringArray(srv.included_json);
            const options = parseStringArray(srv.options_json);
            const category = categories.find((c) => c.id === srv.category_id);

            return (
              <article
                id={srv.slug}
                key={srv.id}
                className="bg-white border border-[#E5DFD5] rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
              >
                <div className="lg:col-span-5 min-h-[260px] bg-[#F2EFE9]">
                  <SafeImage
                    src={srv.cover_image}
                    alt={srv.name_fr}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#5C574F]">
                      <span>
                        {String(idx + 1).padStart(2, '0')} · {category?.name_fr || 'Prestation'}
                      </span>
                      <span className="font-mono-tabular font-medium text-[#1A1917]">
                        {srv.starting_price_mad !== null && srv.starting_price_mad !== undefined
                          ? `${srv.price_is_example ? 'À titre indicatif dès ' : 'À partir de '}${formatMAD(srv.starting_price_mad)}`
                          : t.common.priceOnQuote}
                      </span>
                    </div>

                    <h2 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
                      {locale === 'ar' && srv.name_ar ? srv.name_ar : srv.name_fr}
                    </h2>

                    <p className="text-sm text-[#5C574F] leading-relaxed">{srv.description_fr}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      {included.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1917]">
                            Ce qui est inclus
                          </h3>
                          <ul className="space-y-1.5 text-sm text-[#5C574F]">
                            {included.map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-[#8C6F38] shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="space-y-4">
                        {benefits.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1917]">
                              Atouts clés
                            </h3>
                            <ul className="space-y-1 text-sm text-[#5C574F]">
                              {benefits.map((b) => (
                                <li key={b}>• {b}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {options.length > 0 && (
                          <div className="space-y-1.5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1917]">
                              Options complémentaires
                            </h3>
                            <p className="text-xs text-[#5C574F] leading-relaxed">
                              {options.join(' · ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-[#F2EFE9] flex flex-wrap items-center gap-3">
                    <Link
                      to={`/devis?service=${encodeURIComponent(srv.name_fr)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Demander un devis</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/reserver?service=${encodeURIComponent(srv.name_fr)}`}
                      className="inline-flex items-center px-5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm font-medium text-[#1A1917] hover:border-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
                    >
                      Réserver
                    </Link>
                    <WhatsAppButton
                      label="Discuter via WhatsApp"
                      contextLabel={srv.name_fr}
                      variant="subtle"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
