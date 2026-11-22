import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SafeImage } from '../components/ui/SafeImage.tsx';
import { TextReveal } from '../components/ui/TextReveal.tsx';
import { WhatsAppButton } from '../components/WhatsAppButton.tsx';

export function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      {/* Intro Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
          <p className="text-xs font-medium tracking-widest uppercase text-[#8C6F38]">
            À propos d’EVENT PRO · Casablanca
          </p>
          <TextReveal
            as="h1"
            immediate
            text="L’art de concevoir des événements fluides, élégants et mémorables"
            className="font-serif-display text-4xl sm:text-5xl font-semibold [text-wrap:balance]"
          />
          <p className="text-base text-[#5C574F] leading-relaxed">
            EVENT PRO est une agence d’organisation et de gestion d’événements basée à Casablanca, dédiée aux célébrations privées, familiales et professionnelles. Notre approche associe exigence logistique, sens esthétique et connaissance fine des savoir-faire marocains.
          </p>
          <p className="text-sm text-[#5C574F] leading-relaxed">
            Contenu de présentation modifiable par l’administration selon l’évolution de l’agence.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/reserver"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1A1917] text-[#FAF8F4] text-sm font-medium hover:bg-[#8C6F38] transition-colors"
            >
              <span>Organiser un événement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <WhatsAppButton label="Échanger avec l’équipe" />
          </div>
        </div>
        <div className="lg:col-span-6 rounded-xl overflow-hidden bg-[#F2EFE9] min-h-[340px]">
          <SafeImage
            src="/src/assets/images/wedding_garden_ceremony_1795343964563.jpg"
            alt="Mise en scène d'une cérémonie en plein air à Casablanca"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Story, Mission, Vision */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E5DFD5] rounded-lg p-7 space-y-3">
          <p className="text-xs font-mono-tabular text-[#8C6F38]">01 · Notre histoire</p>
          <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
            Une vocation de précision
          </h2>
          <p className="text-sm text-[#5C574F] leading-relaxed">
            Née à Casablanca pour répondre au besoin d’un accompagnement structuré et transparent, EVENT PRO réunit planification rigoureuse et direction artistique soignée pour chaque réception.
          </p>
        </div>

        <div className="bg-white border border-[#E5DFD5] rounded-lg p-7 space-y-3">
          <p className="text-xs font-mono-tabular text-[#8C6F38]">02 · Notre mission</p>
          <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
            Vous libérer de la charge logistique
          </h2>
          <p className="text-sm text-[#5C574F] leading-relaxed">
            Transformer vos envies en un programme réaliste, coordonner des prestataires vérifiés et veiller au bon déroulement de chaque étape afin que vous viviez pleinement votre événement.
          </p>
        </div>

        <div className="bg-white border border-[#E5DFD5] rounded-lg p-7 space-y-3">
          <p className="text-xs font-mono-tabular text-[#8C6F38]">03 · Notre vision</p>
          <h2 className="font-serif-display text-2xl font-semibold text-[#1A1917]">
            L’élégance intemporelle au Maroc
          </h2>
          <p className="text-sm text-[#5C574F] leading-relaxed">
            Mettre en valeur l’hospitalité marocaine et le design contemporain dans des réceptions authentiques, mesurées et adaptées à chaque famille comme à chaque entreprise.
          </p>
        </div>
      </section>

      {/* Values, Team & Approach */}
      <section className="bg-[#F2EFE9] border border-[#E5DFD5] rounded-xl p-8 sm:p-12 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
              Nos valeurs & notre approche
            </h2>
            <p className="text-sm text-[#5C574F] leading-relaxed">
              Nous privilégions l’écoute attentive, la clarté budgétaire en MAD et le respect des délais. Chaque projet débute par un diagnostic précis du lieu, de la jauge d’invités et des priorités esthétiques, suivi d’un devis détaillé et d’un planning partagé.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#1A1917] pt-2">
              <li className="bg-white border border-[#E5DFD5] rounded-md px-4 py-3">Créativité maîtrisée</li>
              <li className="bg-white border border-[#E5DFD5] rounded-md px-4 py-3">Exigence de qualité</li>
              <li className="bg-white border border-[#E5DFD5] rounded-md px-4 py-3">Fiabilité opérationnelle</li>
              <li className="bg-white border border-[#E5DFD5] rounded-md px-4 py-3">Satisfaction client</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif-display text-3xl font-semibold text-[#1A1917]">
              Notre équipe & notre expertise
            </h2>
            <p className="text-sm text-[#5C574F] leading-relaxed">
              Notre équipe pluridisciplinaire rassemble des coordinateurs de projets événementiels, des scénographes floraux et des régisseurs techniques mobilisés sur Casablanca, Bouskoura, Dar Bouazza et Mohammedia.
            </p>
            <div className="bg-white border border-[#E5DFD5] rounded-lg p-5 space-y-2">
              <h3 className="font-serif-display text-xl font-semibold text-[#1A1917]">
                Engagement qualité
              </h3>
              <p className="text-sm text-[#5C574F] leading-relaxed">
                Chaque prestation sélectionnée fait l’objet d’une fiche technique validée avant le jour J : implantation, horaires de livraison, tests sonores et accueil des convives.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
