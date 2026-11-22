import { Link } from 'react-router-dom';
import { useAppData } from '../lib/api.ts';

export function PrivacyPolicyPage() {
  const { settings } = useAppData();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
      <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
        Protection des données · Maroc
      </p>
      <h1 className="font-serif-display text-4xl font-semibold text-[#1A1917]">
        Politique de confidentialité
      </h1>

      <div className="bg-white border border-[#E5DFD5] rounded-xl p-7 sm:p-10 space-y-5 text-sm text-[#5C574F] leading-relaxed">
        <p>
          {settings.company_name} attache une importance particulière à la confidentialité des données personnelles confiées par ses clients, prospects et visiteurs à Casablanca et au Maroc.
        </p>

        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917] pt-2">
          1. Finalité de la collecte
        </h2>
        <p>
          Les informations recueillies via nos formulaires de réservation, de demande de devis, de contact ou de création de compte client (nom, email, téléphone, détails d’événement) sont utilisées exclusivement pour étudier votre projet, établir vos devis en MAD et assurer le suivi de nos prestations.
        </p>

        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917] pt-2">
          2. Cadre applicable (Loi n° 09-08)
        </h2>
        <p>
          Le traitement des données à caractère personnel est conçu dans le respect des principes de la loi marocaine n° 09-08 relative à la protection des personnes physiques à l’égard du traitement des données à caractère personnel (finalité explicite, proportionnalité, confidentialité et sécurité des accès), sous réserve des déclarations et autorisations nécessaires auprès de la CNDP avant mise en exploitation commerciale.
        </p>

        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917] pt-2">
          3. Sécurité & conservation
        </h2>
        <p>
          Les mots de passe sont chiffrés côté serveur par dérivation cryptographique PBKDF2-SHA256. Aucune donnée personnelle n’est cédée ou vendue à des tiers. Chaque client n’accède qu’à ses propres demandes et devis.
        </p>

        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917] pt-2">
          4. Vos droits
        </h2>
        <p>
          Vous disposez d’un droit d’accès, de rectification et d’opposition concernant vos données en écrivant à{' '}
          <span className="text-[#1A1917] font-medium">{settings.email}</span>.
        </p>
      </div>
    </div>
  );
}

export function TermsPage() {
  const { settings } = useAppData();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
      <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
        Cadre contractuel · MAD
      </p>
      <h1 className="font-serif-display text-4xl font-semibold text-[#1A1917]">
        Conditions générales de service
      </h1>

      <div className="bg-white border border-[#E5DFD5] rounded-xl p-7 sm:p-10 space-y-5 text-sm text-[#5C574F] leading-relaxed">
        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
          1. Nature des demandes en ligne
        </h2>
        <p>
          Toute demande soumise via le formulaire de réservation ou de devis constitue une prise de contact et d’étude de faisabilité. Aucune réservation n’est considérée comme définitivement confirmée sans l’émission d’un devis détaillé et son acceptation écrite par le client.
        </p>

        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917] pt-2">
          2. Devise et tarification
        </h2>
        <p>
          Les devis et factures sont établis en dirhams marocains (MAD). Les éventuels montants affichés sur le catalogue de services sont purement indicatifs ou mentionnés « Tarif sur devis » selon la complexité de l’événement.
        </p>

        <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917] pt-2">
          3. Zone d’intervention
        </h2>
        <p>
          {settings.company_name} intervient principalement à {settings.service_area}. Pour toute demande hors zone, les modalités logistiques sont précisées au devis.
        </p>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center space-y-5">
      <p className="font-mono-tabular text-xs uppercase tracking-widest text-[#8C6F38]">Erreur 404</p>
      <h1 className="font-serif-display text-4xl sm:text-5xl font-semibold text-[#1A1917]">
        Page introuvable
      </h1>
      <p className="text-sm text-[#5C574F]">
        La page recherchée n’existe pas ou a été déplacée.
      </p>
      <div className="pt-2 flex justify-center gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors"
        >
          Retour à l’accueil
        </Link>
        <Link
          to="/reserver"
          className="px-5 py-2.5 rounded-md border border-[#D5CEC2] bg-white text-sm font-medium text-[#1A1917]"
        >
          Réserver un événement
        </Link>
      </div>
    </div>
  );
}
