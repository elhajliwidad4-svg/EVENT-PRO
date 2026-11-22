import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext.tsx';
import { AppDataProvider } from './lib/api.ts';
import { Layout } from './components/Layout.tsx';
import { CustomCursor } from './components/CustomCursor.tsx';
import { ScrollProgressBar } from './components/ScrollProgressBar.tsx';
import { WelcomePopup } from './components/WelcomePopup.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { BookingPage } from './pages/BookingPage.tsx';
import { QuotePage } from './pages/QuotePage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { ClientDashboardPage } from './pages/ClientDashboardPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { NotFoundPage, PrivacyPolicyPage, TermsPage } from './pages/LegalPages.tsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <LanguageProvider>
      <AppDataProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ScrollProgressBar />
          <CustomCursor />
          <WelcomePopup />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage mode="services" />} />
              <Route path="/evenements" element={<ServicesPage mode="events" />} />
              <Route path="/reserver" element={<BookingPage />} />
              <Route path="/devis" element={<QuotePage />} />
              <Route path="/galerie" element={<GalleryPage />} />
              <Route path="/a-propos" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/espace-client" element={<ClientDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
              <Route path="/conditions" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppDataProvider>
    </LanguageProvider>
  );
}
