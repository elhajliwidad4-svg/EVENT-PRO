import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SafeImage } from './ui/SafeImage.tsx';
import { TextReveal } from './ui/TextReveal.tsx';

interface ExperienceCard {
  id: string;
  label: string;
  goldTitle: string;
  subtitle: string;
  image: string;
  to: string;
}

const EXPERIENCE_CARDS: ExperienceCard[] = [
  {
    id: 'exp_salles',
    label: 'Salles',
    goldTitle: 'Salles & Lieux d’Exception',
    subtitle: 'Villas à Anfa, jardins de Bouskoura et terrasses vue mer à Ain Diab.',
    image: '/src/assets/images/venue_terrace_aindiab_1795344879254.jpg',
    to: '/services#location-salles',
  },
  {
    id: 'exp_photographes',
    label: 'Photographes',
    goldTitle: 'Photographes & Cinéastes',
    subtitle: 'Reportages éditoriaux naturels, films 4K et galeries privées haute définition.',
    image: '/src/assets/images/photographer_event_casablanca_1795344978976.jpg',
    to: '/services#photographie-videographie',
  },
  {
    id: 'exp_traiteurs',
    label: 'Traiteurs',
    goldTitle: 'Traiteurs & Art Culinaire',
    subtitle: 'Gastronomie marocaine, cocktails dînatoires et service en salle attentif.',
    image: '/src/assets/images/catering_floral_table_1795343966400.jpg',
    to: '/services#traiteur-buffet',
  },
  {
    id: 'exp_dj',
    label: 'DJ',
    goldTitle: 'DJ, Son & Mise en Lumière',
    subtitle: 'Programmation musicale sur mesure, acoustique claire et éclairage architectural.',
    image: '/src/assets/images/dj_lighting_soiree_1795344978735.jpg',
    to: '/services#sonorisation-eclairage-dj',
  },
  {
    id: 'exp_decoration',
    label: 'Décoration',
    goldTitle: 'Décoration & Art Floral',
    subtitle: 'Arches florales, tables d’honneur, cristallerie et scénographies immersives.',
    image: '/src/assets/images/floral_arch_decor_1795344660354.jpg',
    to: '/services#decoration-florale',
  },
  {
    id: 'exp_organisation',
    label: 'Organisation',
    goldTitle: 'Organisation & Coordination',
    subtitle: 'Pilotage complet de votre événement à Casablanca, du premier croquis au jour J.',
    image: '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
    to: '/services#organisation-mariage',
  },
];

export function ExploreByExperienceSection() {
  return (
    <section
      aria-label="Explore by Experience"
      className="bg-[#FAF8F4] py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
              Univers sur mesure · Casablanca
            </p>
            <TextReveal
              as="h2"
              text="Explore by Experience"
              className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
            />
            <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed">
              Découvrez chacun de nos six pôles de savoir-faire pour composer une réception harmonieuse et cohérente.
            </p>
          </div>
          <Link
            to="/reserver"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1A1917] hover:text-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Composer mon événement</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPERIENCE_CARDS.map((card, index) => (
            <Link
              key={card.id}
              to={card.to}
              className="group relative block aspect-[4/3] rounded-xl overflow-hidden bg-[#1A1917] border border-[#E5DFD5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6F38]"
            >
              {/* Image with smooth hover zoom */}
              <SafeImage
                src={card.image}
                alt={`${card.label} — ${card.goldTitle}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none"
              />

              {/* Base contrast scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              {/* Progressive black veil on hover */}
              <div className="absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" />

              {/* Content overlay */}
              <div className="absolute inset-0 p-6 sm:p-7 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#E6D5B8]">
                  <span className="font-mono-tabular">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 text-[#E6C88A]">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Resting category title */}
                  <p className="text-xs font-medium uppercase tracking-widest text-white/90 transition-opacity duration-300 group-hover:text-[#E6C88A]">
                    {card.label}
                  </p>

                  {/* Gold title appearing progressively on hover */}
                  <h3 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#E6C88A] opacity-90 sm:opacity-0 sm:translate-y-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 motion-reduce:transition-none">
                    {card.goldTitle}
                  </h3>

                  <p className="text-xs text-[#EAE4DA] leading-relaxed sm:opacity-0 sm:translate-y-2 transition-all duration-500 delay-75 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 motion-reduce:transition-none">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
