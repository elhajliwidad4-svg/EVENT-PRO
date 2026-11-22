import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAppData } from '../lib/api.ts';
import { SafeImage } from './ui/SafeImage.tsx';
import { TextReveal } from './ui/TextReveal.tsx';

type MasonryFilter =
  | 'Tous'
  | 'Mariages'
  | 'Décorations'
  | 'Soirées'
  | 'Événements professionnels';

interface MasonryItem {
  id: string;
  title: string;
  caption: string;
  category: Exclude<MasonryFilter, 'Tous'>;
  image_url: string;
  aspectClass: string;
}

const CURATED_MASONRY_ITEMS: MasonryItem[] = [
  {
    id: 'mas_1',
    title: 'Dîner impérial aux chandelles',
    caption: 'Cour intérieure à Casablanca — tables longues en lin ivoire et lanternes en laiton.',
    category: 'Mariages',
    image_url: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
    aspectClass: 'aspect-[16/10]',
  },
  {
    id: 'mas_2',
    title: 'Composition florale & bougeoirs en laiton',
    caption: 'Roses de jardin ivoire, feuillage d’olivier et cristallerie fine sur nappe naturelle.',
    category: 'Décorations',
    image_url: '/src/assets/images/floral_arch_decor_1795344660354.jpg',
    aspectClass: 'aspect-[3/4]',
  },
  {
    id: 'mas_3',
    title: 'Soirée privée sous les arcades d’Anfa',
    caption: 'Terrasse illuminée au crépuscule avec salons lounge et oliviers centenaires.',
    category: 'Soirées',
    image_url: '/src/assets/images/evening_soiree_cocktails_1795344660836.jpg',
    aspectClass: 'aspect-[3/4]',
  },
  {
    id: 'mas_4',
    title: 'Forum & dîner de gala d’entreprise',
    caption: 'Scénographie corporate épurée avec régie audiovisuelle et accueil VIP à Casablanca.',
    category: 'Événements professionnels',
    image_url: '/src/assets/images/corporate_gala_casablanca_1795343965280.jpg',
    aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'mas_5',
    title: 'Cérémonie dans les jardins privés',
    caption: 'Arche florale d’orchidées blanches, allée en travertine et chaises en bois clair.',
    category: 'Mariages',
    image_url: '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
    aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'mas_6',
    title: 'Salon de soirée marocaine & henné',
    caption: 'Lanternes ciselées, broderies ivoire et fleurs blanches en ambiance feutrée.',
    category: 'Soirées',
    image_url: '/src/assets/images/moroccan_henna_salon_1795343965226.jpg',
    aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'mas_7',
    title: 'Art de la table & cocktail gastronomique',
    caption: 'Présentoirs en travertine et bouquets pastel pour réceptions sur mesure.',
    category: 'Décorations',
    image_url: '/src/assets/images/catering_floral_table_1795343966400.jpg',
    aspectClass: 'aspect-square',
  },
];

const FILTERS: MasonryFilter[] = [
  'Tous',
  'Mariages',
  'Décorations',
  'Soirées',
  'Événements professionnels',
];

function mapAdminCategory(cat: string): Exclude<MasonryFilter, 'Tous'> {
  if (cat === 'Mariages') return 'Mariages';
  if (cat === 'Décoration' || cat === 'Traiteur') return 'Décorations';
  if (cat === 'Événements professionnels') return 'Événements professionnels';
  return 'Soirées';
}

export function MasonryGallerySection() {
  const { gallery } = useAppData();
  const [activeFilter, setActiveFilter] = useState<MasonryFilter>('Tous');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = useMemo(() => {
    const knownUrls = new Set(CURATED_MASONRY_ITEMS.map((i) => i.image_url));
    const extras: MasonryItem[] = gallery
      .filter((g) => !knownUrls.has(g.image_url))
      .map((g, idx) => ({
        id: g.id,
        title: g.title,
        caption: g.caption,
        category: mapAdminCategory(g.category),
        image_url: g.image_url,
        aspectClass: idx % 2 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]',
      }));
    return [...CURATED_MASONRY_ITEMS, ...extras];
  }, [gallery]);

  const filtered = useMemo(
    () => (activeFilter === 'Tous' ? items : items.filter((item) => item.category === activeFilter)),
    [items, activeFilter]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight')
        setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length));
      if (e.key === 'ArrowLeft')
        setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, filtered.length]);

  const activeItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <section className="bg-[#F2EFE9] border-y border-[#E5DFD5] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
              Galerie Masonry · Inspirations
            </p>
            <TextReveal
              as="h2"
              text="Mariages, décorations, soirées et événements professionnels"
              className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
            />
          </div>
          <Link
            to="/galerie"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1A1917] hover:text-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Ouvrir la galerie complète</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter);
                setLightboxIndex(null);
              }}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#1A1917] text-[#FAF8F4]'
                  : 'bg-white border border-[#E5DFD5] text-[#5C574F] hover:text-[#1A1917]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Responsive Masonry Columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {filtered.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              className="group relative block w-full text-left break-inside-avoid rounded-lg overflow-hidden bg-white border border-[#E5DFD5] hover:border-[#8C6F38] transition-colors cursor-pointer"
            >
              <div className={`w-full overflow-hidden bg-[#EAE4DA] ${item.aspectClass}`}>
                <SafeImage
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4 sm:p-5 space-y-1">
                <p className="text-xs font-medium text-[#8C6F38]">{item.category}</p>
                <h3 className="font-serif-display text-xl font-semibold text-[#1A1917]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5C574F] leading-relaxed">{item.caption}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#1A1917] rounded-lg overflow-hidden border border-[#3E3A34]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Fermer l’aperçu"
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/10] bg-black">
              <SafeImage
                src={activeItem.image_url}
                alt={activeItem.title}
                priority
                className="w-full h-full object-contain"
              />
              {filtered.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Image précédente"
                    onClick={() =>
                      setLightboxIndex((i) =>
                        i === null ? 0 : (i - 1 + filtered.length) % filtered.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Image suivante"
                    onClick={() =>
                      setLightboxIndex((i) => (i === null ? 0 : (i + 1) % filtered.length))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#FAF8F4]">
              <div className="space-y-1">
                <p className="text-xs text-[#C19F5E]">{activeItem.category}</p>
                <h3 className="font-serif-display text-2xl font-medium">{activeItem.title}</h3>
                <p className="text-sm text-[#CFC9BE]">{activeItem.caption}</p>
              </div>
              <span className="font-mono-tabular text-xs text-[#A39C90] shrink-0">
                {(lightboxIndex ?? 0) + 1} / {filtered.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
