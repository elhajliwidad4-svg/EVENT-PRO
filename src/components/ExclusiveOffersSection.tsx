import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { SafeImage } from './ui/SafeImage.tsx';
import { TextReveal } from './ui/TextReveal.tsx';

interface OfferItem {
  id: string;
  code: string;
  category: string;
  title: string;
  validity: string;
  oldPriceDh: number;
  newPriceDh: number;
  image: string;
  includes: string[];
  serviceParam: string;
}

const EXCLUSIVE_OFFERS: OfferItem[] = [
  {
    id: 'off_floral',
    code: 'Offre 01',
    category: 'Décoration & Art Floral',
    title: 'Pack Scénographie Florale & Table d’Honneur',
    validity: 'Offre saisonnière · Casablanca',
    oldPriceDh: 12500,
    newPriceDh: 9800,
    image: '/src/assets/images/floral_arch_decor_1795344660354.jpg',
    includes: [
      'Arche florale en roses de jardin et feuillage d’olivier',
      '10 centres de table avec bougeoirs en laiton',
      'Installation et reprise complètes sur site',
    ],
    serviceParam: 'Pack Scénographie Florale (9 800 DH)',
  },
  {
    id: 'off_henna',
    code: 'Offre 02',
    category: 'Cérémonies Marocaines',
    title: 'Formule Soirée Henné & Salon Traditionnel',
    validity: 'Réservations anticipées · Grand Casablanca',
    oldPriceDh: 16000,
    newPriceDh: 12900,
    image: '/src/assets/images/moroccan_henna_salon_1795343965226.jpg',
    includes: [
      'Salon traditionnel complet avec broderies ivoire',
      'Éclairage par lanternes ciselées et bougies',
      'Compositions florales blanches et coordination accueil',
    ],
    serviceParam: 'Formule Soirée Henné (12 900 DH)',
  },
  {
    id: 'off_media_dj',
    code: 'Offre 03',
    category: 'Image & Animation',
    title: 'Duo Photographie, Film 4K & Régie DJ',
    validity: 'Valable sur les dates en semaine & dimanche',
    oldPriceDh: 14000,
    newPriceDh: 10900,
    image: '/src/assets/images/dj_lighting_soiree_1795344978735.jpg',
    includes: [
      'Reportage photographique complet + galerie privée',
      'Film récapitulatif 4K monté avec prise de son',
      'DJ, sonorisation salle et mise en lumière chaude',
    ],
    serviceParam: 'Duo Photo, Film 4K & DJ (10 900 DH)',
  },
  {
    id: 'off_corporate',
    code: 'Offre 04',
    category: 'Événements Professionnels',
    title: 'Forfait Séminaire & Cocktail (jusqu’à 80 pers.)',
    validity: 'Entreprises · Casablanca',
    oldPriceDh: 24000,
    newPriceDh: 19500,
    image: '/src/assets/images/corporate_gala_casablanca_1795343965280.jpg',
    includes: [
      'Régie son, microphonie sans fil et projection HD',
      'Pauses café d’accueil et cocktail déjeunatoire',
      'Coordinateur technique dédié sur place',
    ],
    serviceParam: 'Forfait Séminaire & Cocktail (19 500 DH)',
  },
];

function formatDH(amount: number): string {
  return `${new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(amount)} DH`;
}

export function ExclusiveOffersSection() {
  return (
    <section
      aria-label="Exclusive Offers"
      className="bg-[#FAF8F4] py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
              Privilèges saisonniers · Casablanca
            </p>
            <TextReveal
              as="h2"
              text="Exclusive Offers"
              className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
            />
            <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed">
              Profitez de conditions préférentielles sur nos packs de prestations événementielles. Tarifs exprimés en dirhams marocains (DH), sous réserve de disponibilité à votre date.
            </p>
          </div>
          <Link
            to="/devis"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1A1917] hover:text-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Demander un devis sur mesure</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXCLUSIVE_OFFERS.map((offer) => {
            const savings = offer.oldPriceDh - offer.newPriceDh;
            return (
              <article
                key={offer.id}
                className="bg-white border border-[#E5DFD5] rounded-xl overflow-hidden flex flex-col sm:flex-row items-stretch transition-colors hover:border-[#8C6F38]"
              >
                <div className="sm:w-2/5 min-h-[220px] bg-[#F2EFE9] shrink-0">
                  <SafeImage
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C574F]">
                      <span className="font-mono-tabular font-medium text-[#8C6F38]">
                        {offer.code}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{offer.category}</span>
                    </div>

                    <h3 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                      {offer.title}
                    </h3>

                    {/* Old & New Prices in DH */}
                    <div className="pt-1 pb-2 border-y border-[#F2EFE9] flex flex-wrap items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono-tabular text-sm text-[#8D867B] line-through">
                          {formatDH(offer.oldPriceDh)}
                        </span>
                        <span className="font-mono-tabular text-2xl font-semibold text-[#1A1917]">
                          {formatDH(offer.newPriceDh)}
                        </span>
                      </div>
                      <span className="font-mono-tabular text-xs font-medium text-[#8C6F38]">
                        Économie : {formatDH(savings)}
                      </span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-[#5C574F]">
                      {offer.includes.map((line) => (
                        <li key={line} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#8C6F38] shrink-0 mt-0.5" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-[#8D867B]">{offer.validity}</span>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/devis?service=${encodeURIComponent(offer.serviceParam)}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#1A1917] text-[#FAF8F4] text-xs font-medium hover:bg-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Profiter de l’offre</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
