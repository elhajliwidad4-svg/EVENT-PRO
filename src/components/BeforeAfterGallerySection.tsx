import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MoveHorizontal, Sparkles } from 'lucide-react';
import { TextReveal } from './ui/TextReveal.tsx';

interface ComparisonPair {
  id: string;
  code: string;
  title: string;
  location: string;
  eventType: string;
  guests: string;
  beforeImage: string;
  beforeAlt: string;
  afterImage: string;
  afterAlt: string;
  beforeLabel: string;
  afterLabel: string;
  details: string[];
}

const COMPARISON_PAIRS: ComparisonPair[] = [
  {
    id: 'cour-anfa',
    code: '01',
    title: 'Cour Impériale — Anfa',
    location: 'Quartier Anfa, Casablanca',
    eventType: 'Mariage & Dîner aux chandelles',
    guests: '220 convives',
    beforeImage: '/src/assets/images/courtyard_before_decor_1795345265198.jpg',
    beforeAlt: 'Cour intérieure architecturale à Anfa avant installation de la décoration',
    afterImage: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
    afterAlt: 'Cour intérieure transformée avec lustres, arches florales et tables aux chandelles',
    beforeLabel: 'Avant · Architecture brute',
    afterLabel: 'Après · Scénographie EVENT PRO',
    details: [
      'Arches de roses blanches & feuillage',
      'Lustres suspendus & éclairage ambré',
      'Tables d’honneur & vaisselle dorée',
    ],
  },
  {
    id: 'grand-salon',
    code: '02',
    title: 'Grand Salon Panoramique',
    location: 'Casablanca Centre',
    eventType: 'Gala d’entreprise & Remise de prix',
    guests: '340 convives',
    beforeImage: '/src/assets/images/ballroom_before_decor_1795345265104.jpg',
    beforeAlt: 'Grand salon de réception moderne vide avant installation événementielle',
    afterImage: '/src/assets/images/corporate_gala_casablanca_1795343965280.jpg',
    afterAlt: 'Grand salon de gala habillé de tables rondes lumineuses et scène centrale',
    beforeLabel: 'Avant · Salle nue',
    afterLabel: 'Après · Mise en scène Gala',
    details: [
      'Mise en lumière architecturale chaude',
      'Scène centrale & sonorisation linéaire',
      'Nappage ivoire & centres de table floraux',
    ],
  },
];

export function BeforeAfterGallerySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(52);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activePair = COMPARISON_PAIRS[activeIndex];

  const updatePositionFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawPercent = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, rawPercent));
    setSliderPos(clamped);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPos((prev) => Math.max(0, prev - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPos((prev) => Math.min(100, prev + step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPos(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPos(100);
    }
  };

  const handleSelectPair = (idx: number) => {
    setActiveIndex(idx);
    setIsDragging(false);
    setSliderPos(52);
  };

  const afterShare = Math.round(100 - sliderPos);

  return (
    <section
      aria-label="Galerie Before & After"
      className="bg-[#F2EFE9] border-y border-[#E5DFD5] py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
              Métamorphose d’espaces · Casablanca
            </p>
            <TextReveal
              as="h2"
              text="Galerie Before & After"
              className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
            />
            <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed">
              Déplacez le curseur interactif de gauche à droite pour comparer un lieu brut avant notre arrivée et sa transformation complète le jour de la réception.
            </p>
          </div>

          <Link
            to="/devis?service=Décoration%20événementielle"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-xs font-medium hover:bg-[#8C6F38] transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto"
          >
            <span>Imaginer votre scénographie</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Venue Switcher */}
        <div
          role="tablist"
          aria-label="Sélectionner une transformation de salle"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {COMPARISON_PAIRS.map((pair, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={pair.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectPair(idx)}
                className={`text-left p-5 rounded-lg border transition-all duration-300 flex items-start justify-between gap-4 ${
                  isActive
                    ? 'bg-white border-[#8C6F38] shadow-sm'
                    : 'bg-[#FAF8F4]/70 border-[#E5DFD5] hover:bg-white hover:border-[#C19F5E]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 text-xs">
                    <span
                      className={`font-mono-tabular font-semibold ${
                        isActive ? 'text-[#8C6F38]' : 'text-[#8D867B]'
                      }`}
                    >
                      {pair.code}
                    </span>
                    <span className="text-[#D5CEC2]" aria-hidden="true">
                      /
                    </span>
                    <span className="text-[#5C574F]">{pair.location}</span>
                  </div>
                  <h3 className="font-serif-display text-xl sm:text-2xl font-semibold text-[#1A1917]">
                    {pair.title}
                  </h3>
                  <p className="text-xs text-[#5C574F]">
                    {pair.eventType} · {pair.guests}
                  </p>
                </div>

                <span
                  className={`mt-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive ? 'text-[#8C6F38]' : 'text-[#8D867B]'
                  }`}
                >
                  {isActive ? 'Sélectionnée' : 'Comparer'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Comparison Stage */}
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-3 sm:p-4 space-y-4 shadow-sm">
          <div
            ref={containerRef}
            data-cursor="image"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-lg bg-[#1A1917] select-none touch-none cursor-ew-resize group"
          >
            {/* Base Layer: AFTER (Visible on the right side of the slider) */}
            <img
              key={`${activePair.id}-after`}
              src={activePair.afterImage}
              alt={activePair.afterAlt}
              draggable={false}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            />

            {/* Clipped Overlay Layer: BEFORE (Visible on the left side up to sliderPos%) */}
            <div
              className={`absolute inset-0 pointer-events-none ${
                isDragging
                  ? 'transition-none'
                  : 'transition-[clip-path] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
              }`}
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img
                key={`${activePair.id}-before`}
                src={activePair.beforeImage}
                alt={activePair.beforeAlt}
                draggable={false}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              />
            </div>

            {/* Subtle Edge Labels (fade gently when pushed to edge so they never collide) */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute top-4 left-4 z-10 px-3 py-1.5 rounded bg-[#1A1917]/80 backdrop-blur-sm border border-white/15 text-[11px] font-medium tracking-wider uppercase text-[#FAF8F4] transition-opacity duration-200 ${
                sliderPos < 16 ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {activePair.beforeLabel}
            </div>

            <div
              aria-hidden="true"
              className={`pointer-events-none absolute top-4 right-4 z-10 px-3 py-1.5 rounded bg-[#1A1917]/85 backdrop-blur-sm border border-[#C19F5E]/50 text-[11px] font-medium tracking-wider uppercase text-[#E6C88A] transition-opacity duration-200 ${
                sliderPos > 84 ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {activePair.afterLabel}
            </div>

            {/* Vertical Divider & Gold Handle */}
            <div
              role="slider"
              tabIndex={0}
              aria-label={`Curseur de comparaison avant et après pour ${activePair.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sliderPos)}
              aria-valuetext={`${Math.round(sliderPos)}% avant décoration, ${afterShare}% après décoration`}
              onKeyDown={handleSliderKeyDown}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (containerRef.current) {
                  containerRef.current.setPointerCapture(e.pointerId);
                }
                setIsDragging(true);
              }}
              style={{ left: `${sliderPos}%` }}
              className={`absolute inset-y-0 z-20 -translate-x-1/2 flex flex-col items-center justify-center focus:outline-none ${
                isDragging
                  ? 'transition-none'
                  : 'transition-[left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
              }`}
            >
              {/* Hairline */}
              <div
                aria-hidden="true"
                className="w-0.5 flex-1 bg-gradient-to-b from-white/50 via-[#E6C88A] to-white/50 shadow-[0_0_12px_rgba(26,25,23,0.6)]"
              />

              {/* Interactive Knob */}
              <div
                className={`w-11 h-11 rounded-full bg-[#1A1917] border-2 flex items-center justify-center text-[#E6C88A] shadow-xl transition-transform duration-150 ${
                  isDragging
                    ? 'scale-110 border-[#E6C88A]'
                    : 'border-[#C19F5E] group-hover:scale-105'
                } focus-visible:ring-2 focus-visible:ring-[#E6C88A]`}
              >
                <MoveHorizontal className="w-5 h-5" strokeWidth={1.75} />
              </div>

              {/* Hairline */}
              <div
                aria-hidden="true"
                className="w-0.5 flex-1 bg-gradient-to-t from-white/50 via-[#E6C88A] to-white/50 shadow-[0_0_12px_rgba(26,25,23,0.6)]"
              />
            </div>
          </div>

          {/* Controls & Transformation Summary Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2 pt-1 pb-2">
            {/* Key transformation deliverables */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#5C574F]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#8C6F38]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Transformation réalisée :</span>
              </span>
              {activePair.details.map((detail, i) => (
                <span key={detail} className="inline-flex items-center gap-4">
                  <span>{detail}</span>
                  {i < activePair.details.length - 1 && (
                    <span className="text-[#D5CEC2]" aria-hidden="true">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>

            {/* Smooth Reveal Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsDragging(false);
                  setSliderPos(100);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  sliderPos >= 92
                    ? 'bg-[#1A1917] text-[#FAF8F4] border-[#1A1917]'
                    : 'bg-[#FAF8F4] text-[#5C574F] border-[#E5DFD5] hover:border-[#8C6F38] hover:text-[#1A1917]'
                }`}
              >
                Salle Avant
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDragging(false);
                  setSliderPos(50);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono-tabular border transition-colors ${
                  sliderPos > 40 && sliderPos < 60
                    ? 'bg-[#1A1917] text-[#E6C88A] border-[#1A1917]'
                    : 'bg-[#FAF8F4] text-[#5C574F] border-[#E5DFD5] hover:border-[#8C6F38] hover:text-[#1A1917]'
                }`}
              >
                50 / 50
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDragging(false);
                  setSliderPos(0);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  sliderPos <= 8
                    ? 'bg-[#8C6F38] text-[#FAF8F4] border-[#8C6F38]'
                    : 'bg-[#FAF8F4] text-[#5C574F] border-[#E5DFD5] hover:border-[#8C6F38] hover:text-[#1A1917]'
                }`}
              >
                Résultat Après
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
