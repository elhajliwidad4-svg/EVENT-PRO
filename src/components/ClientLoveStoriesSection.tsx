import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Star } from 'lucide-react';
import { useAppData } from '../lib/api.ts';
import { SafeImage } from './ui/SafeImage.tsx';
import { TextReveal } from './ui/TextReveal.tsx';

const STORY_IMAGES = [
  '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
  '/src/assets/images/corporate_gala_casablanca_1795343965280.jpg',
  '/src/assets/images/moroccan_henna_salon_1795343965226.jpg',
];

export function ClientLoveStoriesSection() {
  const { testimonials } = useAppData();

  return (
    <section
      aria-label="Client Love Stories"
      className="bg-[#F2EFE9] border-y border-[#E5DFD5] py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
              Histoires & Retours d’Expérience · Casablanca
            </p>
            <TextReveal
              as="h2"
              text="Client Love Stories"
              className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
            />
            <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed">
              Découvrez les récits de couples, familles et directions d’entreprise accompagnés à Casablanca et dans sa région.
            </p>
          </div>
          <p className="text-xs text-[#5C574F] shrink-0">
            Témoignages de démonstration — prêts pour vos retours clients vérifiés
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => {
            const cover = STORY_IMAGES[idx % STORY_IMAGES.length];
            return (
              <article
                key={item.id}
                className="group bg-white border border-[#E5DFD5] rounded-xl overflow-hidden flex flex-col justify-between transition-colors hover:border-[#A8884B]"
              >
                <div>
                  <div className="aspect-[16/10] bg-[#EAE4DA] overflow-hidden">
                    <SafeImage
                      src={cover}
                      alt={`${item.client_name} — ${item.event_type}`}
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </div>

                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <Quote className="w-5 h-5 text-[#8C6F38]" strokeWidth={1.5} />
                      <div className="flex items-center gap-0.5 text-[#A8884B]" aria-label="Note 5 sur 5">
                        {[0, 1, 2, 3, 4].map((star) => (
                          <Star key={star} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>

                    <blockquote className="text-sm text-[#1A1917] leading-relaxed">
                      « {item.quote_text} »
                    </blockquote>
                  </div>
                </div>

                <footer className="px-6 sm:px-7 pb-6 pt-4 border-t border-[#F2EFE9] flex items-end justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-serif-display text-xl font-semibold text-[#1A1917]">
                      {item.client_name}
                    </p>
                    <p className="text-xs text-[#5C574F]">
                      {item.event_type} · {item.city}
                      {item.is_demo ? ' · Exemple de démonstration' : ''}
                    </p>
                  </div>
                </footer>
              </article>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-[#5C574F]">
          <span>Vous souhaitez écrire votre propre histoire avec EVENT PRO ?</span>
          <Link
            to="/reserver"
            className="inline-flex items-center gap-1.5 font-medium text-[#1A1917] hover:text-[#8C6F38] transition-colors"
          >
            <span>Démarrer votre projet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
