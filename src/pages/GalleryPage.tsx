import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAppData } from '../lib/api.ts';
import { SafeImage } from '../components/ui/SafeImage.tsx';
import { TextReveal } from '../components/ui/TextReveal.tsx';

const GALLERY_CATEGORIES = [
  'Tous',
  'Mariages',
  'Décoration',
  'Anniversaires',
  'Événements professionnels',
  'Traiteur',
  'Cérémonies marocaines',
  'Fêtes privées',
];

export function GalleryPage() {
  const { gallery, loading } = useAppData();
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered =
    activeCategory === 'Tous'
      ? gallery
      : gallery.filter((img) => img.category === activeCategory);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length));
      if (e.key === 'ArrowLeft')
        setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, filtered.length]);

  const activeItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
          Portfolio visuel
        </p>
        <TextReveal
          as="h1"
          immediate
          text="Galerie d’inspirations & réalisations"
          className="font-serif-display text-4xl sm:text-5xl font-semibold"
        />
        <p className="text-base text-[#5C574F] leading-relaxed">
          Parcourez nos ambiances de mariages, cérémonies marocaines, tables gastronomiques et réceptions d’entreprise à Casablanca.
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DFD5] pb-4">
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActiveCategory(cat);
              setLightboxIndex(null);
            }}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#1A1917] text-[#FAF8F4]'
                : 'bg-white border border-[#E5DFD5] text-[#5C574F] hover:text-[#1A1917]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#5C574F] py-12 text-center">Chargement de la galerie...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5DFD5] rounded-lg p-12 text-center text-sm text-[#5C574F]">
          Aucune image disponible dans cette catégorie pour le moment.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filtered.map((item, idx) => {
            const aspectClasses = ['aspect-[16/10]', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]'];
            const aspect = aspectClasses[idx % aspectClasses.length];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="group block w-full text-left break-inside-avoid bg-white border border-[#E5DFD5] rounded-lg overflow-hidden hover:border-[#8C6F38] transition-colors cursor-pointer"
              >
                <div className={`${aspect} bg-[#F2EFE9] overflow-hidden`}>
                  <SafeImage
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <p className="text-xs text-[#8C6F38] font-medium">{item.category}</p>
                  <h2 className="font-serif-display text-xl font-semibold text-[#1A1917]">
                    {item.title}
                  </h2>
                  <p className="text-xs text-[#5C574F] leading-relaxed">{item.caption}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

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
            className="relative max-w-5xl w-full bg-[#1A1917] rounded-lg overflow-hidden border border-[#3E3A34]"
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
    </div>
  );
}
