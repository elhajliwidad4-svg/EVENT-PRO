import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Users } from 'lucide-react';
import { SafeImage } from './ui/SafeImage.tsx';
import { TextReveal } from './ui/TextReveal.tsx';

interface ReceptionVenue {
  id: string;
  name: string;
  district: string;
  capacity: string;
  setting: string;
  description: string;
  highlights: string;
  image: string;
}

const RECEPTION_VENUES: ReceptionVenue[] = [
  {
    id: 'venue_ain_diab',
    name: 'Pavillon & Terrasse Vue Océan',
    district: 'Ain Diab · Corniche de Casablanca',
    capacity: '80 à 260 convives',
    setting: 'Extérieur couvert & terrasse pierre',
    description:
      'Un espace ouvert face à l’Atlantique doté de colonnes en travertine et d’une verrière lumineuse, idéal pour les dîners de gala, cocktails dînatoires et réceptions estivales.',
    highlights: 'Coucher de soleil sur l’océan · Acoustique maîtrisée · Accès voiturier',
    image: '/src/assets/images/venue_terrace_aindiab_1795344879254.jpg',
  },
  {
    id: 'venue_anfa_courtyard',
    name: 'Cour Impériale aux Arcades',
    district: 'Anfa · Casablanca',
    capacity: '100 à 350 convives',
    setting: 'Patio architectural & galeries',
    description:
      'Une cour majestueuse encadrée d’arcades sculptées et de lanternes en laiton, pensée pour les grands dîners de mariage aux chandelles et les soirées d’exception.',
    highlights: 'Architecture marocaine · Tables impériales · Éclairage chaleureux',
    image: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
  },
  {
    id: 'venue_bouskoura_gardens',
    name: 'Domaine & Jardins Privés',
    district: 'Bouskoura · Grand Casablanca',
    capacity: '60 à 400 convives',
    setting: 'Jardins arborés & allées en travertine',
    description:
      'Un écrin de verdure au calme absolu, bordé de palmiers et d’oliviers, conçu pour les cérémonies en plein air, réceptions familiales et structures cristal sur mesure.',
    highlights: 'Grand parc paysager · Espace cérémonie dédié · Parking privé',
    image: '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
  },
  {
    id: 'venue_executive_ballroom',
    name: 'Grand Salon Panoramique',
    district: 'Centre & Quartier des Affaires · Casablanca',
    capacity: '120 à 500 convives',
    setting: 'Salle modulable & scène équipée',
    description:
      'Une salle contemporaine baignée de lumière naturelle en journée et sublimée par un éclairage architectural le soir pour conférences, forums et galas d’entreprise.',
    highlights: 'Scène & projection HD · Régie son intégrée · Modularité totale',
    image: '/src/assets/images/corporate_gala_casablanca_1795343965280.jpg',
  },
  {
    id: 'venue_moroccan_salon',
    name: 'Salon Patrimoine & Zellige',
    district: 'Casablanca · Dar Bouazza',
    capacity: '30 à 120 convives',
    setting: 'Salons traditionnels intimes',
    description:
      'Un cadre chaleureux mêlant boiseries de cèdre, zellige ivoire et lanternes artisanales, parfait pour les soirées du henné, fiançailles et réceptions privées.',
    highlights: 'Artisanat marocain · Ambiance feutrée · Service du thé traditionnel',
    image: '/src/assets/images/moroccan_henna_salon_1795343965226.jpg',
  },
];

export function VenueCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const total = RECEPTION_VENUES.length;
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % total);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - endX;
    if (Math.abs(delta) > 45) {
      if (delta > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
  };

  const activeVenue = RECEPTION_VENUES[activeIndex];

  return (
    <section
      aria-label="Carrousel des salles de réception à Casablanca"
      onKeyDown={handleKeyDown}
      className="bg-[#1A1917] text-[#FAF8F4] py-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header + Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-widest uppercase text-[#C19F5E]">
              Lieux & Salles d’Exception · Casablanca
            </p>
            <TextReveal
              as="h2"
              tone="dark"
              text="Des salles de réception choisies pour leur architecture et leur atmosphère"
              className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono-tabular text-xs text-[#CFC9BE] mr-2">
              {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Salle précédente"
              className="w-11 h-11 rounded-md border border-[#3E3A34] bg-[#24221F] text-white flex items-center justify-center hover:border-[#C19F5E] hover:text-[#C19F5E] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Salle suivante"
              className="w-11 h-11 rounded-md border border-[#3E3A34] bg-[#24221F] text-white flex items-center justify-center hover:border-[#C19F5E] hover:text-[#C19F5E] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sliding Horizontal Track */}
        <div
          className="relative overflow-hidden rounded-xl border border-[#2E2B26] bg-[#121110]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {RECEPTION_VENUES.map((venue, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <div key={venue.id} className="w-full shrink-0 relative">
                  <div className="aspect-[16/10] sm:aspect-[16/8.5] lg:aspect-[16/7.5] w-full overflow-hidden bg-[#121110]">
                    <SafeImage
                      src={venue.image}
                      alt={`${venue.name} — ${venue.district}`}
                      priority={idx === 0}
                      className={`w-full h-full object-cover transition-transform duration-1000 ease-out motion-reduce:transition-none ${
                        isCurrent ? 'scale-100' : 'scale-[1.04]'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#11100F]/95 via-[#11100F]/45 to-transparent" />
                  </div>

                  {/* Editorial Overlay Content */}
                  <div className="p-6 sm:p-10 lg:absolute lg:inset-x-0 lg:bottom-0 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div
                      className={`max-w-2xl space-y-3 transition-opacity duration-500 ${
                        isCurrent ? 'opacity-100' : 'opacity-60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#E6D5B8]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C19F5E]" />
                          <span>{venue.district}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1.5 font-mono-tabular">
                          <Users className="w-3.5 h-3.5 text-[#C19F5E]" />
                          <span>{venue.capacity}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{venue.setting}</span>
                      </div>

                      <h3 className="font-serif-display text-3xl sm:text-4xl font-semibold text-white">
                        {venue.name}
                      </h3>

                      <p className="text-sm text-[#DED8CE] leading-relaxed">{venue.description}</p>

                      <p className="text-xs text-[#C19F5E] pt-1">{venue.highlights}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <Link
                        to={`/devis?service=${encodeURIComponent(`Lieu : ${venue.name}`)}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C19F5E] text-[#1A1917] text-xs font-semibold hover:bg-[#D4B577] transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Demander un devis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to="/reserver"
                        className="inline-flex items-center px-5 py-2.5 rounded-md border border-white/30 bg-white/10 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/20 transition-colors whitespace-nowrap shrink-0"
                      >
                        Organiser ici
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Horizontal Thumbnail / Venue Selector Strip */}
        <div
          role="tablist"
          aria-label="Sélection directe des salles"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {RECEPTION_VENUES.map((venue, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={venue.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveIndex(idx)}
                className={`group text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  active
                    ? 'border-[#C19F5E] bg-[#24221F]'
                    : 'border-[#2E2B26] bg-[#161513] hover:border-[#5C574F]'
                }`}
              >
                <div className="aspect-[16/9] rounded overflow-hidden bg-[#121110] mb-2">
                  <SafeImage
                    src={venue.image}
                    alt={venue.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      active ? 'opacity-100' : 'opacity-65 group-hover:opacity-90'
                    }`}
                  />
                </div>
                <p className="font-mono-tabular text-[11px] text-[#C19F5E]">
                  {String(idx + 1).padStart(2, '0')} · {venue.capacity}
                </p>
                <p className="text-xs font-medium text-white truncate mt-0.5">{venue.name}</p>
              </button>
            );
          })}
        </div>

        {/* Live Context Summary */}
        <p className="sr-only" aria-live="polite">
          Salle affichée : {activeVenue.name}, {activeVenue.district}, {activeVenue.capacity}.
        </p>
      </div>
    </section>
  );
}
