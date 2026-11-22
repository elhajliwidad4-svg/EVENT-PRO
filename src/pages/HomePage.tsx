import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Camera,
  CheckCircle2,
  Compass,
  Flower2,
  MapPin,
  Music,
  ShieldCheck,
  Sparkles,
  Speaker,
  Utensils,
  Armchair,
} from 'lucide-react';
import { useAppData } from '../lib/api.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { SafeImage } from '../components/ui/SafeImage.tsx';
import { TextReveal } from '../components/ui/TextReveal.tsx';
import { WhatsAppButton } from '../components/WhatsAppButton.tsx';
import { StatsCounterSection } from '../components/StatsCounterSection.tsx';
import { MasonryGallerySection } from '../components/MasonryGallerySection.tsx';
import { VenueCarouselSection } from '../components/VenueCarouselSection.tsx';
import { ExploreByExperienceSection } from '../components/ExploreByExperienceSection.tsx';
import { ExclusiveOffersSection } from '../components/ExclusiveOffersSection.tsx';
import { ClientLoveStoriesSection } from '../components/ClientLoveStoriesSection.tsx';
import { EventTimelineSection } from '../components/EventTimelineSection.tsx';
import { BeforeAfterGallerySection } from '../components/BeforeAfterGallerySection.tsx';

const HOME_SERVICE_CARDS = [
  {
    title: 'Organisation complète',
    description: 'Pilotage intégral du rétroplanning, coordination des prestataires et présence sur site le jour J.',
    icon: Sparkles,
    image: '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
    slug: 'organisation-mariage',
  },
  {
    title: 'Décoration événementielle',
    description: 'Scénographie sur mesure, compositions florales fraîches, tables d’honneur et mise en lumière.',
    icon: Flower2,
    image: '/src/assets/images/catering_floral_table_1795343966400.jpg',
    slug: 'decoration-florale',
  },
  {
    title: 'Traiteur et buffet',
    description: 'Gastronomie marocaine et internationale, cocktails dînatoires, vaisselle fine et brigade de service.',
    icon: Utensils,
    image: '/src/assets/images/catering_floral_table_1795343966400.jpg',
    slug: 'traiteur-buffet',
  },
  {
    title: 'Location de salles',
    description: 'Sélection de villas, jardins, riads et salles de réception à Anfa, Bouskoura, Ain Diab et Dar Bouazza.',
    icon: MapPin,
    image: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
    slug: 'location-salles',
  },
  {
    title: 'Photographie et vidéo',
    description: 'Reportage éditorial, film 4K et galerie numérique privée pour préserver chaque instant.',
    icon: Camera,
    image: '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
    slug: 'photographie-videographie',
  },
  {
    title: 'Sonorisation et éclairage',
    description: 'Acoustique équilibrée, microphones sans fil et éclairage architectural adapté au lieu.',
    icon: Speaker,
    image: '/src/assets/images/corporate_gala_casablanca_1795343965280.jpg',
    slug: 'sonorisation-eclairage-dj',
  },
  {
    title: 'Animation et DJ',
    description: 'Programmation musicale sur mesure, DJ, orchestres traditionnels et ensembles acoustiques.',
    icon: Music,
    image: '/src/assets/images/moroccan_henna_salon_1795343965226.jpg',
    slug: 'sonorisation-eclairage-dj',
  },
  {
    title: 'Mobilier et accessoires',
    description: 'Tables banquet, assises de réception, salons marocains et équipements livrés et installés.',
    icon: Armchair,
    image: '/src/assets/images/moroccan_henna_salon_1795343965226.jpg',
    slug: 'mobilier-equipement',
  },
];

const WHY_US_ITEMS = [
  {
    number: '01',
    title: 'Organisation professionnelle',
    description: 'Méthodologie rigoureuse, rétroplanning clair et présence discrète de coordinateurs dédiés.',
    icon: Award,
  },
  {
    number: '02',
    title: 'Prestataires de qualité',
    description: 'Collaboration avec des partenaires sélectionnés à Casablanca pour leur fiabilité et leur savoir-faire.',
    icon: ShieldCheck,
  },
  {
    number: '03',
    title: 'Solutions personnalisées',
    description: 'Chaque réception est conçue autour de vos goûts, du nombre d’invités et de vos priorités budgétaires.',
    icon: Sparkles,
  },
  {
    number: '04',
    title: 'Accompagnement de A à Z',
    description: 'Un interlocuteur unique du premier échange jusqu’à la clôture de l’événement.',
    icon: Compass,
  },
  {
    number: '05',
    title: 'Transparence des devis',
    description: 'Chiffrage détaillé poste par poste en dirhams marocains (MAD), sans coûts cachés.',
    icon: CheckCircle2,
  },
  {
    number: '06',
    title: 'Expertise locale à Casablanca',
    description: 'Connaissance approfondie des lieux, des accès et des traditions de réception au Maroc.',
    icon: MapPin,
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Choisissez votre événement',
    description: 'Précisez la nature de votre réception, la date souhaitée et le nombre estimé de convives.',
  },
  {
    step: '02',
    title: 'Personnalisez vos prestations',
    description: 'Sélectionnez les pôles souhaités : décoration, traiteur, salle, photo, sonorisation ou mobilier.',
  },
  {
    step: '03',
    title: 'Recevez votre devis',
    description: 'Notre équipe étudie votre projet et vous adresse une proposition chiffrée sur mesure en MAD.',
  },
  {
    step: '04',
    title: 'Confirmez et profitez de votre événement',
    description: 'Une fois validé ensemble, nous orchestrons les préparatifs et la coordination le jour J.',
  },
];

export function HomePage() {
  const { categories, settings } = useAppData();
  const { t, locale } = useLanguage();

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="relative min-h-[78vh] flex items-end lg:items-center overflow-hidden bg-[#1A1917]">
        <div className="absolute inset-0">
          <SafeImage
            src="/src/assets/images/hero_casablanca_gala_1795343965521.jpg"
            alt="Réception de luxe aux chandelles à Casablanca orchestrée par EVENT PRO"
            priority
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/90 via-[#1A1917]/55 to-[#1A1917]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-[#E6D5B8]">
              <span className="inline-block w-8 h-px bg-[#A8884B]" aria-hidden="true" />
              <span>{t.hero.kicker}</span>
            </div>

            <TextReveal
              as="h1"
              tone="dark"
              immediate
              text={t.hero.headline}
              className="font-serif-display text-4xl sm:text-5xl lg:text-[3.75rem] font-semibold leading-[1.08] [text-wrap:balance]"
            />

            <p className="text-base sm:text-lg text-[#EAE4DA] leading-relaxed max-w-xl">
              {t.hero.subheadline}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/reserver"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#A8884B] text-[#1A1917] font-semibold text-sm hover:bg-[#C19F5E] transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md border border-white/40 bg-white/10 backdrop-blur-sm text-white font-medium text-sm hover:bg-white/20 transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.hero.secondaryCta}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Editorial Slogan Strip */}
      <section className="border-b border-[#E5DFD5] bg-[#F2EFE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-serif-display italic text-xl sm:text-2xl text-[#1A1917]">
            « {settings.slogan_fr} »
          </p>
          <div className="flex items-center gap-4 text-sm text-[#5C574F]">
            <span>Devis personnalisés en MAD</span>
            <span aria-hidden="true">·</span>
            <Link to="/devis" className="font-medium text-[#8C6F38] hover:text-[#1A1917] transition-colors">
              Demander un devis gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Event Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
              Savoir-faire événementiel
            </p>
            <TextReveal
              as="h2"
              text="Des réceptions pensées pour chaque moment marquant"
              className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
            />
          </div>
          <Link
            to="/evenements"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1A1917] hover:text-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Explorer tous nos formats</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <article
              key={cat.id}
              className="group bg-white border border-[#E5DFD5] rounded-lg overflow-hidden flex flex-col transition-colors hover:border-[#A8884B]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#F2EFE9]">
                <SafeImage
                  src={cat.cover_image}
                  alt={locale === 'ar' && cat.name_ar ? cat.name_ar : cat.name_fr}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                    {locale === 'ar' && cat.name_ar ? cat.name_ar : cat.name_fr}
                  </h3>
                  <p className="text-sm text-[#5C574F] leading-relaxed">{cat.description_fr}</p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-[#F2EFE9]">
                  <Link
                    to={`/services#${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8C6F38] hover:text-[#1A1917] transition-colors"
                  >
                    <span>{t.common.discover}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/reserver?type=${encodeURIComponent(cat.name_fr)}`}
                    className="text-xs font-medium text-[#5C574F] hover:text-[#1A1917] transition-colors"
                  >
                    Réserver
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Our Services Section */}
      <section className="bg-[#F2EFE9] border-y border-[#E5DFD5] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl space-y-3">
              <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
                Prestations sur mesure
              </p>
              <TextReveal
                as="h2"
                text="Nos services pour une organisation sereine"
                className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
              />
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm font-medium text-[#1A1917] hover:border-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Voir les 11 services détaillés</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOME_SERVICE_CARDS.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.title}
                  className="bg-white border border-[#E5DFD5] rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] bg-[#EAE4DA] overflow-hidden">
                      <SafeImage src={srv.image} alt={srv.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-[#8C6F38]">
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                        <h3 className="font-serif-display text-xl font-semibold text-[#1A1917]">
                          {srv.title}
                        </h3>
                      </div>
                      <p className="text-sm text-[#5C574F] leading-relaxed">{srv.description}</p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-3 border-t border-[#F2EFE9] flex items-center justify-between text-xs font-medium">
                    <Link
                      to={`/services#${srv.slug}`}
                      className="text-[#1A1917] hover:text-[#8C6F38] transition-colors"
                    >
                      En savoir plus
                    </Link>
                    <Link
                      to={`/devis?service=${encodeURIComponent(srv.title)}`}
                      className="text-[#8C6F38] hover:text-[#1A1917] transition-colors"
                    >
                      Demander un devis
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Explore by Experience (6 photographic cards) */}
      <ExploreByExperienceSection />

      {/* Horizontal Reception Venues Carousel */}
      <VenueCarouselSection />

      {/* 4. Why Choose EVENT PRO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl space-y-3 mb-12">
          <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
            Nos engagements
          </p>
          <TextReveal
            as="h2"
            text="Pourquoi confier votre événement à EVENT PRO"
            className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {WHY_US_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.number} className="border-t border-[#E5DFD5] pt-6 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#8C6F38]">
                  <span className="font-mono-tabular font-medium">{item.number}</span>
                  <Icon className="w-4 h-4" strokeWidth={1.6} />
                </div>
                <h3 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#5C574F] leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Interactive Masonry Gallery */}
      <MasonryGallerySection />

      {/* 6. How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-xl space-y-3 mb-12">
          <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
            Parcours client
          </p>
          <TextReveal
            as="h2"
            text="Comment fonctionne votre projet"
            className="font-serif-display text-3xl sm:text-4xl font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item) => (
            <div key={item.step} className="bg-white border border-[#E5DFD5] rounded-lg p-6 space-y-3">
              <span className="font-mono-tabular text-xs font-medium text-[#8C6F38]">
                Étape {item.step}
              </span>
              <h3 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                {item.title}
              </h3>
              <p className="text-sm text-[#5C574F] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Black & White Animated Statistics */}
      <StatsCounterSection />

      {/* Exclusive Promotional Offers in DH */}
      <ExclusiveOffersSection />

      {/* 7. Client Love Stories */}
      <ClientLoveStoriesSection />

      {/* Animated Event Timeline */}
      <EventTimelineSection />

      {/* Interactive Before & After Comparison Gallery */}
      <BeforeAfterGallerySection />

      {/* 8. Final Call To Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 text-center">
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-10 sm:p-14 space-y-6">
          <TextReveal
            as="h2"
            text="Vous avez un projet ? Nous sommes prêts à le réaliser."
            className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
          />
          <p className="text-sm sm:text-base text-[#5C574F] max-w-2xl mx-auto leading-relaxed">
            Échangez avec notre équipe basée à Casablanca pour structurer votre cahier des charges, planifier une visite ou recevoir un devis personnalisé en dirhams marocains.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/reserver"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Parlons de votre événement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-[#D5CEC2] bg-white text-[#1A1917] text-sm font-medium hover:border-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Demander un devis</span>
            </Link>
            <WhatsAppButton label="Demander un devis via WhatsApp" contextLabel="Nouveau projet événementiel" />
          </div>
        </div>
      </section>
    </div>
  );
}
