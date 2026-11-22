import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react';
import { SafeImage } from './ui/SafeImage.tsx';
import { useAppData } from '../lib/api.ts';

const WELCOME_STORAGE_KEY = 'eventpro_welcome_seen_v1';

function hasSeenWelcome(): boolean {
  try {
    return window.localStorage.getItem(WELCOME_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markWelcomeSeen(): void {
  try {
    window.localStorage.setItem(WELCOME_STORAGE_KEY, '1');
  } catch {
    // Ignore storage access errors in restricted contexts
  }
}

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const { settings } = useAppData();

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/espace-client')) {
      return;
    }
    if (hasSeenWelcome()) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    markWelcomeSeen();
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1A1917]/65 backdrop-blur-sm animate-[fadeIn_240ms_ease-out] motion-reduce:animate-none print:hidden"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#FAF8F4] border border-[#D5CEC2] rounded-xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fermer la fenêtre de bienvenue"
          className="absolute top-3.5 right-3.5 z-20 w-10 h-10 rounded-md bg-white/90 border border-[#E5DFD5] text-[#1A1917] flex items-center justify-center hover:border-[#8C6F38] hover:text-[#8C6F38] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Editorial Visual */}
        <div className="relative md:col-span-5 h-48 md:h-auto bg-[#1A1917] overflow-hidden">
          <SafeImage
            src="/src/assets/images/hero_casablanca_gala_1795343965521.jpg"
            alt="Réception élégante orchestrée par EVENT PRO à Casablanca"
            priority
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917]/85 via-[#1A1917]/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-[#FAF8F4] space-y-1">
            <p className="text-[11px] uppercase tracking-widest text-[#E6C88A]">
              Casablanca · Maroc
            </p>
            <p className="font-serif-display italic text-lg leading-snug">
              « {settings.slogan_fr || 'Vos événements, notre expertise. Vos moments, notre passion.'} »
            </p>
          </div>
        </div>

        {/* Right Welcome Content */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4 pr-6">
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Maison d’événementiel</span>
            </div>

            <h2
              id="welcome-popup-title"
              className="font-serif-display text-3xl sm:text-[2rem] font-semibold text-[#1A1917] leading-tight"
            >
              Bienvenue chez {settings.company_name || 'EVENT PRO'}
            </h2>

            <p className="text-sm text-[#5C574F] leading-relaxed">
              Mariages, fiançailles, soirées du henné, anniversaires ou galas d’entreprise à Casablanca : notre équipe orchestre chaque détail de votre réception sur mesure.
            </p>

            <ul className="space-y-2 pt-1 text-xs sm:text-sm text-[#1A1917]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8C6F38] shrink-0 mt-0.5" />
                <span>Devis détaillés en dirhams marocains (MAD) sans frais cachés</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8C6F38] shrink-0 mt-0.5" />
                <span>Salles &amp; villas d’exception à Anfa, Bouskoura, Ain Diab et Dar Bouazza</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8C6F38] shrink-0 mt-0.5" />
                <span>Pilotage complet de la réservation jusqu’au Jour J</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#E5DFD5]">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/reserver"
                onClick={handleClose}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors whitespace-nowrap"
              >
                <span>Organiser mon événement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/devis"
                onClick={handleClose}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-[#1A1917] text-sm font-medium hover:border-[#8C6F38] transition-colors whitespace-nowrap"
              >
                Demander un devis
              </Link>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="text-xs text-[#5C574F] hover:text-[#1A1917] underline underline-offset-4 transition-colors"
            >
              Continuer la visite du site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
