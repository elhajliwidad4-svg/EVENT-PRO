import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, MessageCircle, X } from 'lucide-react';
import { useAppData } from '../lib/api.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { buildWhatsAppUrl } from '../lib/whatsapp.ts';

export function Layout({ children }: { children: React.ReactNode }) {
  const { settings, user } = useAppData();
  const { locale, setLocale, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const waUrl = buildWhatsAppUrl(settings.whatsapp_number);

  const navItems = [
    { to: '/', label: t.nav.home },
    { to: '/services', label: t.nav.services },
    { to: '/evenements', label: t.nav.events },
    { to: '/galerie', label: t.nav.gallery },
    { to: '/a-propos', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#1A1917]">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 bg-[#FAF8F4]/95 backdrop-blur border-b border-[#E5DFD5]">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark only */}
          <Link
            to="/"
            className="font-serif-display text-2xl font-semibold tracking-tight text-[#1A1917] whitespace-nowrap shrink-0"
          >
            {settings.company_name || 'EVENT PRO'}
          </Link>

          {/* Zone 2: Concise single-line navigation links */}
          <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium whitespace-nowrap shrink-0 transition-colors pb-0.5 border-b ${
                    isActive
                      ? 'text-[#1A1917] border-[#8C6F38]'
                      : 'text-[#5C574F] border-transparent hover:text-[#1A1917] hover:border-[#D5CEC2]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Drawer Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/reserver"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.book}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-[#E5DFD5] bg-white text-[#1A1917] hover:border-[#8C6F38] transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#FAF8F4] border-b border-[#E5DFD5] px-4 py-5 space-y-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive ? 'bg-[#F2EFE9] text-[#1A1917]' : 'text-[#5C574F] hover:bg-[#F2EFE9]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="pt-3 border-t border-[#E5DFD5] flex flex-col gap-2">
              <Link
                to="/reserver"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium"
              >
                Réserver un événement
              </Link>
              <Link
                to="/devis"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-[#1A1917] text-sm font-medium"
              >
                Demander un devis
              </Link>
              <div className="flex items-center justify-between pt-2 text-xs text-[#5C574F]">
                <Link
                  to="/espace-client"
                  onClick={() => setMobileOpen(false)}
                  className="hover:text-[#1A1917] font-medium"
                >
                  {user ? `Compte (${user.full_name})` : t.nav.clientPortal}
                </Link>
                <button
                  type="button"
                  onClick={() => setLocale(locale === 'fr' ? 'ar' : 'fr')}
                  className="px-2.5 py-1 rounded border border-[#D5CEC2] bg-white text-[#1A1917] font-medium"
                >
                  {locale === 'fr' ? 'العربية (RTL)' : 'Français'}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Quiet Editorial Footer */}
      {!isAdminRoute && (
        <footer className="bg-[#1A1917] text-[#FAF8F4] border-t border-[#2E2B26] mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <div className="space-y-4">
                <p className="font-serif-display text-2xl font-semibold tracking-tight text-white">
                  {settings.company_name || 'EVENT PRO'}
                </p>
                <p className="text-sm text-[#CFC9BE] leading-relaxed">
                  {settings.slogan_fr}
                </p>
                <p className="text-xs text-[#A39C90] leading-relaxed">
                  Agence d’organisation d’événements privés et professionnels à Casablanca et dans le Grand Casablanca.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif-display text-lg font-medium text-white">Navigation</h3>
                <ul className="space-y-2 text-sm text-[#CFC9BE]">
                  <li>
                    <Link to="/" className="hover:text-white transition-colors">
                      Accueil
                    </Link>
                  </li>
                  <li>
                    <Link to="/services" className="hover:text-white transition-colors">
                      Nos services
                    </Link>
                  </li>
                  <li>
                    <Link to="/evenements" className="hover:text-white transition-colors">
                      Nos événements
                    </Link>
                  </li>
                  <li>
                    <Link to="/reserver" className="hover:text-white transition-colors">
                      Réserver un événement
                    </Link>
                  </li>
                  <li>
                    <Link to="/devis" className="hover:text-white transition-colors">
                      Demander un devis
                    </Link>
                  </li>
                  <li>
                    <Link to="/galerie" className="hover:text-white transition-colors">
                      Galerie
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif-display text-lg font-medium text-white">Prestations & Espaces</h3>
                <ul className="space-y-2 text-sm text-[#CFC9BE]">
                  <li>
                    <Link to="/services#mariages" className="hover:text-white transition-colors">
                      Mariages & fiançailles
                    </Link>
                  </li>
                  <li>
                    <Link to="/services#ceremonies-marocaines" className="hover:text-white transition-colors">
                      Cérémonies marocaines
                    </Link>
                  </li>
                  <li>
                    <Link to="/services#evenements-professionnels" className="hover:text-white transition-colors">
                      Événements professionnels
                    </Link>
                  </li>
                  <li>
                    <Link to="/espace-client" className="hover:text-white transition-colors">
                      {t.nav.clientPortal}
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin" className="hover:text-white transition-colors">
                      {t.nav.adminPortal}
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif-display text-lg font-medium text-white">Casablanca & Contact</h3>
                <ul className="space-y-2 text-sm text-[#CFC9BE]">
                  <li>{settings.phone}</li>
                  <li>{settings.email}</li>
                  <li className="text-xs text-[#A39C90]">{settings.service_area}</li>
                </ul>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded border border-[#3E3A34] hover:border-[#A8884B] text-[#FAF8F4] transition-colors"
                    >
                      WhatsApp
                    </a>
                  ) : (
                    <Link
                      to="/contact"
                      className="px-3 py-1.5 rounded border border-[#3E3A34] hover:border-[#A8884B] text-[#FAF8F4] transition-colors"
                    >
                      WhatsApp
                    </Link>
                  )}
                  <a
                    href={settings.instagram_url || 'https://instagram.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded border border-[#3E3A34] hover:border-[#A8884B] text-[#FAF8F4] transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href={settings.facebook_url || 'https://facebook.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded border border-[#3E3A34] hover:border-[#A8884B] text-[#FAF8F4] transition-colors"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#2E2B26] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#A39C90]">
              <p>
                © {new Date().getFullYear()} {settings.company_name || 'EVENT PRO'} — Casablanca, Maroc. Tous droits réservés.
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <Link to="/confidentialite" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
                <Link to="/conditions" className="hover:text-white transition-colors">
                  Conditions générales
                </Link>
                <button
                  type="button"
                  onClick={() => setLocale(locale === 'fr' ? 'ar' : 'fr')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {locale === 'fr' ? 'Version arabe (RTL)' : 'Version française (LTR)'}
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Subtle Floating WhatsApp Affordance on Public Pages */}
      {!isAdminRoute && (
        <div className="fixed bottom-5 right-5 z-30 hidden sm:block">
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discuter sur WhatsApp"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-xs font-medium shadow-md border border-[#3E3A34] hover:bg-[#8C6F38] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <Link
              to="/contact"
              aria-label="Discuter de mon événement"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-xs font-medium shadow-md border border-[#3E3A34] hover:bg-[#8C6F38] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Parlons de votre projet</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
