import { useEffect, useRef, useState } from 'react';
import { Award, BookmarkCheck, CalendarCheck, Handshake } from 'lucide-react';
import { TextReveal } from './ui/TextReveal.tsx';

interface StatItem {
  id: string;
  label: string;
  detail: string;
  target: number;
  suffix: string;
  icon: typeof CalendarCheck;
}

const STATS_ITEMS: StatItem[] = [
  {
    id: 'events',
    label: 'Événements organisés',
    detail: 'Mariages, cérémonies & galas à Casablanca',
    target: 240,
    suffix: '+',
    icon: CalendarCheck,
  },
  {
    id: 'clients',
    label: 'Clients satisfaits',
    detail: 'Familles et entreprises accompagnées',
    target: 225,
    suffix: '+',
    icon: Award,
  },
  {
    id: 'partners',
    label: 'Prestataires partenaires',
    detail: 'Traiteurs, lieux, fleuristes & régies vérifiés',
    target: 48,
    suffix: '+',
    icon: Handshake,
  },
  {
    id: 'bookings',
    label: 'Réservations',
    detail: 'Projets planifiés et suivis de A à Z',
    target: 310,
    suffix: '+',
    icon: BookmarkCheck,
  },
];

function AnimatedCounter({
  target,
  suffix,
  start,
}: {
  target: number;
  suffix: string;
  start: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    let frameId = 0;
    const duration = 1500;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [start, target]);

  return (
    <span className="font-serif-display text-4xl sm:text-5xl font-semibold text-white tabular-nums tracking-tight">
      {value}
      <span className="text-[#C19F5E]">{suffix}</span>
    </span>
  );
}

export function StatsCounterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasEntered(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Chiffres clés EVENT PRO"
      className="bg-[#11100F] text-white border-y border-[#2A2824] py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2A2824] pb-8">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-medium tracking-widest uppercase text-[#C19F5E]">
              Savoir-faire chiffré · Casablanca
            </p>
            <TextReveal
              as="h2"
              tone="dark"
              text="Une expérience reconnue au service de vos célébrations"
              className="font-serif-display text-3xl sm:text-4xl font-semibold [text-wrap:balance]"
            />
          </div>
          <p className="text-xs text-[#9E988E]">
            Données indicatives de présentation · Grand Casablanca
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-[#181715] border border-[#2A2824] rounded-lg p-7 flex flex-col justify-between space-y-6 transition-colors hover:border-[#C19F5E]/60"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-md border border-[#C19F5E]/35 bg-[#1F1D1A] flex items-center justify-center text-[#C19F5E]">
                    <Icon className="w-5 h-5" strokeWidth={1.6} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <AnimatedCounter
                      target={item.target}
                      suffix={item.suffix}
                      start={hasEntered}
                    />
                  </div>
                  <h3 className="font-serif-display text-xl font-medium text-white">
                    {item.label}
                  </h3>
                  <p className="text-xs text-[#A8A298] leading-relaxed">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
