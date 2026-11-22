import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  Compass,
  Flower2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { TextReveal } from './ui/TextReveal.tsx';

interface TimelineStep {
  number: string;
  phase: string;
  title: string;
  description: string;
  deliverable: string;
  icon: typeof CalendarCheck;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    number: '01',
    phase: 'J-90 à J-60',
    title: 'Demande de réservation & cadrage',
    description:
      'Vous partagez la nature de votre événement, la date souhaitée, le nombre estimé d’invités et votre budget en DH via notre formulaire.',
    deliverable: 'Référence dossier attribuée & premier échange conseil',
    icon: ClipboardCheck,
  },
  {
    number: '02',
    phase: 'J-60 à J-45',
    title: 'Repérage de salle & devis détaillé',
    description:
      'Nous organisons les visites des lieux adaptés à Casablanca (Anfa, Bouskoura, Ain Diab) et établissons un devis transparent poste par poste.',
    deliverable: 'Proposition chiffrée en DH & pré-sélection du lieu',
    icon: MapPin,
  },
  {
    number: '03',
    phase: 'J-45 à J-20',
    title: 'Direction artistique, art floral & traiteur',
    description:
      'Validation des planches d’ambiance, choix des fleurs fraîches, nappages, mobilier et dégustation du menu gastronomique.',
    deliverable: 'Plan de décoration & menu validés',
    icon: Flower2,
  },
  {
    number: '04',
    phase: 'J-15 à J-7',
    title: 'Rétroplanning & coordination prestataires',
    description:
      'Élaboration du conducteur minute par minute, vérifications acoustiques, fiches techniques son/lumière et confirmation de chaque équipe.',
    deliverable: 'Conducteur général partagé avec tous les intervenants',
    icon: Compass,
  },
  {
    number: '05',
    phase: 'La veille · J-1',
    title: 'Installation, mise en lumière & répétition',
    description:
      'Montage des arches florales, dressage des tables, réglages d’éclairage architectural et tests microphoniques sur le site.',
    deliverable: 'Contrôle qualité complet avant accueil',
    icon: Sparkles,
  },
  {
    number: '06',
    phase: 'Jour J',
    title: 'Orchestration complète & accueil des convives',
    description:
      'Notre équipe dirige discrètement le timing de la réception, la coordination en coulisses et le bon déroulé de chaque moment clé.',
    deliverable: 'Vous profitez pleinement de vos invités',
    icon: CalendarCheck,
  },
];

export function EventTimelineSection() {
  const [visibleSteps, setVisibleSteps] = useState<Record<number, boolean>>({});
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      const all: Record<number, boolean> = {};
      TIMELINE_STEPS.forEach((_, idx) => {
        all[idx] = true;
      });
      setVisibleSteps(all);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idxAttr = entry.target.getAttribute('data-step-index');
            if (idxAttr !== null) {
              const idx = Number(idxAttr);
              setVisibleSteps((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -30px 0px' }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const revealedCount = Object.values(visibleSteps).filter(Boolean).length;
  const progressPercent = Math.round((revealedCount / TIMELINE_STEPS.length) * 100);

  return (
    <section
      aria-label="Event Timeline"
      className="bg-[#FAF8F4] py-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
              De la réservation au Jour J · Casablanca
            </p>
            <TextReveal
              as="h2"
              text="Event Timeline"
              className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
            />
            <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed">
              Une feuille de route claire et progressive pour suivre chaque étape de préparation jusqu’au soir de votre réception.
            </p>
          </div>
          <Link
            to="/reserver"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-xs font-medium hover:bg-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Lancer la première étape</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Vertical Animated Timeline */}
        <div className="relative pl-12 sm:pl-16 space-y-6">
          {/* Background vertical line */}
          <div
            aria-hidden="true"
            className="absolute left-5 sm:left-7 top-4 bottom-4 w-px bg-[#E5DFD5]"
          />
          {/* Progressive gold fill line */}
          <div
            aria-hidden="true"
            className="absolute left-5 sm:left-7 top-4 w-px bg-[#8C6F38] transition-all duration-700 ease-out motion-reduce:transition-none"
            style={{ height: `calc(${progressPercent}% - 2rem)` }}
          />

          {TIMELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isVisible = Boolean(visibleSteps[idx]);
            return (
              <div
                key={step.number}
                data-step-index={idx}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                style={{ transitionDelay: `${Math.min(idx * 70, 280)}ms` }}
                className={`relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                {/* Timeline node */}
                <div
                  className={`absolute -left-12 sm:-left-16 top-6 w-10 h-10 sm:w-12 sm:h-12 rounded-md border flex items-center justify-center font-mono-tabular text-xs font-semibold transition-colors duration-500 ${
                    isVisible
                      ? 'bg-[#1A1917] border-[#8C6F38] text-[#E6C88A]'
                      : 'bg-white border-[#D5CEC2] text-[#8D867B]'
                  }`}
                >
                  {step.number}
                </div>

                {/* Step Card */}
                <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 sm:p-7 space-y-3 transition-colors hover:border-[#A8884B]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#8C6F38]">
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                      <span className="font-mono-tabular">{step.phase}</span>
                    </div>
                    <span className="text-xs text-[#5C574F]">{step.deliverable}</span>
                  </div>

                  <h3 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#5C574F] leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
