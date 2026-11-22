export const INITIAL_CATEGORIES = [
  {
    id: 'cat_mariages',
    slug: 'mariages',
    name_fr: 'Mariages',
    name_ar: 'حفلات الزفاف',
    description_fr:
      'Conception intégrale, scénographie florale et coordination le jour J pour des réceptions d’exception à Casablanca.',
    cover_image: '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
    display_order: 1,
  },
  {
    id: 'cat_fiancailles',
    slug: 'fiancailles',
    name_fr: 'Fiançailles',
    name_ar: 'حفلات الخطوبة',
    description_fr:
      'Célébrations intimes ou familiales mêlant élégance contemporaine et accueil marocain chaleureux.',
    cover_image: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
    display_order: 2,
  },
  {
    id: 'cat_anniversaires',
    slug: 'anniversaires',
    name_fr: 'Anniversaires',
    name_ar: 'أعياد الميلاد',
    description_fr:
      'Décors sur mesure, tables gourmandes et ambiance musicale pour marquer chaque étape importante.',
    cover_image: '/src/assets/images/catering_floral_table_1795343966400.jpg',
    display_order: 3,
  },
  {
    id: 'cat_corporate',
    slug: 'evenements-professionnels',
    name_fr: 'Événements professionnels',
    name_ar: 'الفعاليات المهنية',
    description_fr:
      'Conférences, séminaires, lancements de produits, team building et dîners de gala d’entreprise à Casablanca.',
    cover_image: '/src/assets/images/corporate_gala_casablanca_1795343965280.jpg',
    display_order: 4,
  },
  {
    id: 'cat_ceremonies',
    slug: 'ceremonies-marocaines',
    name_fr: 'Cérémonies marocaines',
    name_ar: 'الطقوس المغربية',
    description_fr:
      'Soirées henné, salons traditionnels raffinés, amariya et mise en valeur du patrimoine marocain.',
    cover_image: '/src/assets/images/moroccan_henna_salon_1795343965226.jpg',
    display_order: 5,
  },
  {
    id: 'cat_privees',
    slug: 'fetes-privees',
    name_fr: 'Fêtes privées',
    name_ar: 'الحفلات الخاصة',
    description_fr:
      'Baby showers, remises de diplômes, réceptions familiales et soirées privées en villa ou salon.',
    cover_image: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
    display_order: 6,
  },
];

export const INITIAL_SERVICES = [
  {
    id: 'srv_wedding',
    category_id: 'cat_mariages',
    slug: 'organisation-mariage',
    name_fr: 'Organisation complète de mariage',
    name_ar: 'تنظيم حفل الزفاف بالكامل',
    short_description_fr:
      'Pilotage intégral de votre mariage à Casablanca, de la conception du thème à la coordination du jour J.',
    description_fr:
      'Notre équipe vous accompagne étape par étape pour imaginer un mariage à votre image : sélection du lieu, sélection des prestataires, planification budgétaire, rétroplanning et présence dédiée le jour de la réception.',
    benefits_json: JSON.stringify([
      'Interlocuteur unique dédié tout au long des préparatifs',
      'Maîtrise des prestataires fiables à Casablanca et environs',
      'Gestion sereine du timing et des imprévus le jour J',
    ]),
    included_json: JSON.stringify([
      'Étude de concept et planche d’inspiration personnalisée',
      'Repérage et sélection du lieu de réception',
      'Coordination complète des prestataires et du déroulé',
      'Présence de coordinateurs sur site le jour de l’événement',
    ]),
    options_json: JSON.stringify([
      'Gestion des invitations et confirmations (RSVP)',
      'Accueil et logistique des invités internationaux',
      'Cérémonie de henné coordonnée la veille',
    ]),
    cover_image: '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
    starting_price_mad: null,
    price_is_example: 0,
    is_available: 1,
    display_order: 1,
  },
  {
    id: 'srv_engagement',
    category_id: 'cat_fiancailles',
    name_ar: 'تنظيم حفل الخطوبة',
    slug: 'organisation-fiancailles',
    name_fr: 'Organisation de fiançailles',
    short_description_fr:
      'Une réception élégante et intimiste pour célébrer votre engagement auprès de vos proches.',
    description_fr:
      'Nous concevons des cérémonies de fiançailles harmonieuses, à domicile, en villa privée ou dans un salon de réception à Casablanca, en alliant raffinement décoratif et accueil traditionnel.',
    benefits_json: JSON.stringify([
      'Scénographie adaptée aux espaces privés ou salons',
      'Coordination discrète et respectueuse des traditions familiales',
      'Budget maîtrisé avec devis transparent',
    ]),
    included_json: JSON.stringify([
      'Décoration florale de l’espace d’honneur',
      'Mise en table et art de recevoir',
      'Coordination traiteur, pâtisserie et animation douce',
    ]),
    options_json: JSON.stringify([
      'Reportage photo & vidéo',
      'Ensemble musical traditionnel ou acoustique',
      'Coin photo sur mesure',
    ]),
    cover_image: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
    starting_price_mad: null,
    price_is_example: 0,
    is_available: 1,
    display_order: 2,
  },
  {
    id: 'srv_birthday',
    category_id: 'cat_anniversaires',
    slug: 'organisation-anniversaire',
    name_fr: 'Organisation d’anniversaire & fêtes privées',
    name_ar: 'تنظيم أعياد الميلاد والحفلات الخاصة',
    short_description_fr:
      'Anniversaires, baby showers et remises de diplômes mis en scène avec créativité et convivialité.',
    description_fr:
      'Que ce soit pour un dîner assis en petit comité, une fête de jardin à Anfa ou une baby shower raffinée, nous orchestrons décor, buffet, gâteau signature et ambiance musicale.',
    benefits_json: JSON.stringify([
      'Thématique et palette chromatique entièrement personnalisées',
      'Formules modulables selon le nombre d’invités',
      'Installation et démontage clé en main',
    ]),
    included_json: JSON.stringify([
      'Direction artistique et habillage du lieu',
      'Installation du mobilier et centres de table',
      'Coordination de la réception',
    ]),
    options_json: JSON.stringify([
      'Sweet table et gâteau d’événement sur mesure',
      'DJ et sonorisation d’ambiance',
      'Photographe événementiel',
    ]),
    cover_image: '/src/assets/images/catering_floral_table_1795343966400.jpg',
    starting_price_mad: 4500,
    price_is_example: 1,
    is_available: 1,
    display_order: 3,
  },
  {
    id: 'srv_corporate',
    category_id: 'cat_corporate',
    slug: 'evenements-professionnels',
    name_fr: 'Événements professionnels, séminaires & team building',
    name_ar: 'تنظيم المؤتمرات وفعاليات الشركات',
    short_description_fr:
      'Conférences, lancements de marque, séminaires et galas corporate avec rigueur technique.',
    description_fr:
      'EVENT PRO accompagne les entreprises casablancaises et groupes internationaux dans l’organisation de leurs temps forts : plénières, pauses gastronomiques, team building, soirées annuelles et accueil VIP.',
    benefits_json: JSON.stringify([
      'Respect strict de votre charte graphique et protocole d’entreprise',
      'Équipement audiovisuel et scénique fiable',
      'Facturation claire en MAD et devis détaillé par poste',
    ]),
    included_json: JSON.stringify([
      'Repérage de salle de conférence ou hôtel partenaire',
      'Régie technique son, microphonie et projection',
      'Gestion des pauses café, déjeuners ou dîners de gala',
    ]),
    options_json: JSON.stringify([
      'Captation vidéo multicaméra et reportage photo corporate',
      'Activités de cohésion d’équipe (team building)',
      'Hôtesses d’accueil et signalétique personnalisée',
    ]),
    cover_image: '/src/assets/images/corporate_gala_casablanca_1795343965280.jpg',
    starting_price_mad: null,
    price_is_example: 0,
    is_available: 1,
    display_order: 4,
  },
  {
    id: 'srv_moroccan',
    category_id: 'cat_ceremonies',
    slug: 'ceremonies-marocaines',
    name_fr: 'Cérémonies marocaines & soirées henné',
    name_ar: 'الطقوس المغربية وليلة الحناء',
    short_description_fr:
      'Mise en scène authentique et contemporaine des traditions marocaines avec soin artisanal.',
    description_fr:
      'Nous sublimons la soirée du henné et les cérémonies traditionnelles grâce à un mobilier marocain raffiné, des lanternes en laiton ciselé, des compositions florales blanches et une coordination fluide.',
    benefits_json: JSON.stringify([
      'Alliance harmonieuse entre artisanat marocain et sobriété contemporaine',
      'Respect des rituels familiaux et des temps de cérémonie',
      'Sélection de salons et espaces adaptés à Casablanca',
    ]),
    included_json: JSON.stringify([
      'Aménagement du salon traditionnel et coin henné',
      'Éclairage chaud par lanternes et bougies',
      'Coordination de l’accueil et du service du thé',
    ]),
    options_json: JSON.stringify([
      'Orchestre andalou, issawa ou dakka marrakchia',
      'Plateau de pâtisseries marocaines fines',
      'Amariya et habillage d’entrée',
    ]),
    cover_image: '/src/assets/images/moroccan_henna_salon_1795343965226.jpg',
    starting_price_mad: null,
    price_is_example: 0,
    is_available: 1,
    display_order: 5,
  },
  {
    id: 'srv_decoration',
    category_id: 'cat_mariages',
    slug: 'decoration-florale',
    name_fr: 'Décoration événementielle & art floral',
    name_ar: 'الديكور وتنسيق الزهور',
    short_description_fr:
      'Scénographie sur mesure, arches florales, tables d’honneur et mise en lumière poétique.',
    description_fr:
      'Nos designers floraux et décorateurs conçoivent des ambiances uniques en fleurs fraîches, textiles nobles, verrerie et bougeoirs, adaptées à l’architecture de votre lieu.',
    benefits_json: JSON.stringify([
      'Palette de couleurs et textures étudiée selon la lumière du lieu',
      'Fleurs fraîches sélectionnées et montages soignés sur place',
      'Cohérence visuelle de l’entrée jusqu’aux tables d’invités',
    ]),
    included_json: JSON.stringify([
      'Proposition esthétique et plan de table décoratif',
      'Centres de table floraux et chemin de table',
      'Installation complète et reprise en fin d’événement',
    ]),
    options_json: JSON.stringify([
      'Arche cérémonielle grand format',
      'Mur floral ou fond de scène personnalisé',
      'Papeterie de table (menus, marque-places)',
    ]),
    cover_image: '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
    starting_price_mad: 6000,
    price_is_example: 1,
    is_available: 1,
    display_order: 6,
  },
  {
    id: 'srv_catering',
    category_id: 'cat_mariages',
    slug: 'traiteur-buffet',
    name_fr: 'Traiteur & buffet gastronomique',
    name_ar: 'خدمات الضيافة والبوفيه',
    short_description_fr:
      'Cuisine marocaine raffinée, gastronomie internationale et cocktails dînatoires soignés.',
    description_fr:
      'Des pièces cocktails délicates aux dîners de gala servis à l’assiette, nous collaborons avec des chefs et brigades de service exigeants pour offrir une expérience culinaire irréprochable.',
    benefits_json: JSON.stringify([
      'Menus sur mesure adaptés aux régimes et préférences des convives',
      'Service en salle attentif et présentation soignée',
      'Dégustation préalable possible sur demande',
    ]),
    included_json: JSON.stringify([
      'Élaboration du menu (cocktail, buffet ou service à table)',
      'Vaisselle, verrerie et nappage de qualité',
      'Personnel de cuisine et maîtres d’hôtel',
    ]),
    options_json: JSON.stringify([
      'Atelier thé à la menthe et pâtisseries marocaines',
      'Bar à mocktails et jus frais pressés',
      'Pièce montée ou wedding cake artisanal',
    ]),
    cover_image: '/src/assets/images/catering_floral_table_1795343966400.jpg',
    starting_price_mad: null,
    price_is_example: 0,
    is_available: 1,
    display_order: 7,
  },
  {
    id: 'srv_venues',
    category_id: 'cat_corporate',
    slug: 'location-salles',
    name_fr: 'Location de salles & lieux d’exception',
    name_ar: 'كراء القاعات والفضاءات',
    short_description_fr:
      'Accès privilégié à des villas, jardins, riads et salles de réception à Casablanca.',
    description_fr:
      'Nous vous aidons à identifier et réserver le cadre idéal selon votre capacité d’accueil et votre budget : villas à Anfa ou Bouskoura, domaines arborés, terrasses vue mer à Ain Diab ou salles modulables.',
    benefits_json: JSON.stringify([
      'Sélection ciblée selon la capacité, le stationnement et l’acoustique',
      'Visites accompagnées avec analyse technique du lieu',
      'Vérification des contraintes horaires et logistiques',
    ]),
    included_json: JSON.stringify([
      'Proposition de lieux disponibles à votre date',
      'Organisation des visites de repérage',
      'Coordination technique avec le gestionnaire du site',
    ]),
    options_json: JSON.stringify([
      'Tente caïdale ou structure cristal en extérieur',
      'Service voiturier et accueil sécurité',
      'Groupe électrogène de secours',
    ]),
    cover_image: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
    starting_price_mad: null,
    price_is_example: 0,
    is_available: 1,
    display_order: 8,
  },
  {
    id: 'srv_photo',
    category_id: 'cat_mariages',
    slug: 'photographie-videographie',
    name_fr: 'Photographie & vidéographie',
    name_ar: 'التصوير الفوتوغرافي والفيديو',
    short_description_fr:
      'Immortalisation sensible et cinématographique de chaque regard, détail et émotion.',
    description_fr:
      'Nos photographes et vidéastes capturent votre événement avec discrétion et sens esthétique, livrant des galeries numériques haute définition, films récapitulatifs et albums d’art.',
    benefits_json: JSON.stringify([
      'Style éditorial naturel sans poses figées',
      'Matériel plein format et prise de son nette pour les discours',
      'Livraison rapide d’un premier aperçu sélectionné',
    ]),
    included_json: JSON.stringify([
      'Couverture photographique sur la durée convenue',
      'Retouche colorimétrique homogène des clichés',
      'Galerie privée en ligne haute résolution',
    ]),
    options_json: JSON.stringify([
      'Film cinématographique 4K avec bande-son',
      'Prises de vues aériennes par drone (selon autorisations)',
      'Livre album imprimé relié lin',
    ]),
    cover_image: '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
    starting_price_mad: 5500,
    price_is_example: 1,
    is_available: 1,
    display_order: 9,
  },
  {
    id: 'srv_sound_dj',
    category_id: 'cat_privees',
    slug: 'sonorisation-eclairage-dj',
    name_fr: 'Sonorisation, éclairage & animation DJ',
    name_ar: 'الصوتيات والإضاءة وتنشيط الدي جي',
    short_description_fr:
      'Acoustique claire, mise en lumière architecturale et programmation musicale sur mesure.',
    description_fr:
      'Une atmosphère réussie repose sur un son équilibré et une lumière flatteuse. Nous fournissons sonorisation professionnelle, éclairage architectural chaud, régie DJ et groupes musicaux.',
    benefits_json: JSON.stringify([
      'Matériel discret et câblage soigneusement dissimulé',
      'Répertoire musical adapté à vos invités (chaabi, oriental, international)',
      'Technicien présent du test son jusqu’à la clôture',
    ]),
    included_json: JSON.stringify([
      'Système de sonorisation adapté à la jauge de la salle',
      'Microphones sans fil pour prises de parole',
      'Éclairage d’ambiance et piste de danse',
    ]),
    options_json: JSON.stringify([
      'DJ généraliste ou spécialisé sur mesure',
      'Violoniste, saxophoniste ou orchestre live',
      'Éclairage architectural extérieur de façade',
    ]),
    cover_image: '/src/assets/images/corporate_gala_casablanca_1795343965280.jpg',
    starting_price_mad: 4000,
    price_is_example: 1,
    is_available: 1,
    display_order: 10,
  },
  {
    id: 'srv_furniture',
    category_id: 'cat_privees',
    slug: 'mobilier-equipement',
    name_fr: 'Location de mobilier & équipements événementiels',
    name_ar: 'كراء الأثاث ومعدات الحفلات',
    short_description_fr:
      'Chaises de réception, tables banquet, salons lounge, nappages et accessoires de scène.',
    description_fr:
      'Complétez votre réception avec notre catalogue de mobilier sélectionné : tables rondes ou impériales, chaises croisées ou Napoléon, salons extérieurs, mange-debout, pupitres et estrades.',
    benefits_json: JSON.stringify([
      'Mobilier entretenu et livré prêt à l’installation',
      'Cohérence esthétique avec la décoration choisie',
      'Livraison, mise en place et enlèvement à Casablanca et région',
    ]),
    included_json: JSON.stringify([
      'Préparation et transport aller-retour sur le lieu',
      'Installation selon le plan d’implantation validé',
      'Reprise après événement',
    ]),
    options_json: JSON.stringify([
      'Nappage en lin ou coton épais',
      'Chauffages de terrasse pour soirées d’hiver',
      'Podium, pupitre et piste de danse modulable',
    ]),
    cover_image: '/src/assets/images/moroccan_henna_salon_1795343965226.jpg',
    starting_price_mad: null,
    price_is_example: 0,
    is_available: 1,
    display_order: 11,
  },
];

export const INITIAL_GALLERY = [
  {
    id: 'gal_1',
    title: 'Dîner aux chandelles sous les arcades',
    caption: 'Réception de mariage en cour intérieure à Casablanca — tables impériales, roses blanches et lanternes en laiton.',
    category: 'Mariages',
    image_url: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
    display_order: 1,
    is_featured: 1,
  },
  {
    id: 'gal_2',
    title: 'Cérémonie laïque dans les jardins d’Anfa',
    caption: 'Arche florale d’orchidées et roses crème, allée en travertine et assises en bois clair.',
    category: 'Mariages',
    image_url: '/src/assets/images/wedding_garden_ceremony_1795343964563.jpg',
    display_order: 2,
    is_featured: 1,
  },
  {
    id: 'gal_3',
    title: 'Salon traditionnel de cérémonie du henné',
    caption: 'Zellige contemporain, lanternes ciselées, broderies ivoire et compositions florales blanches.',
    category: 'Cérémonies marocaines',
    image_url: '/src/assets/images/moroccan_henna_salon_1795343965226.jpg',
    display_order: 3,
    is_featured: 1,
  },
  {
    id: 'gal_4',
    title: 'Gala & forum des dirigeants à Casablanca',
    caption: 'Configuration conférence et dîner assis avec éclairage architectural et scénographie épurée.',
    category: 'Événements professionnels',
    image_url: '/src/assets/images/corporate_gala_casablanca_1795343965280.jpg',
    display_order: 4,
    is_featured: 1,
  },
  {
    id: 'gal_5',
    title: 'Art de la table & cocktail gastronomique',
    caption: 'Présentoirs en travertine, verrerie cristalline et bouquets d’inspiration jardin.',
    category: 'Traiteur',
    image_url: '/src/assets/images/catering_floral_table_1795343966400.jpg',
    display_order: 5,
    is_featured: 1,
  },
  {
    id: 'gal_6',
    title: 'Composition florale & bougeoirs en laiton',
    caption: 'Roses de jardin ivoire, feuillage d’olivier et cristallerie fine sur nappe en lin.',
    category: 'Décoration',
    image_url: '/src/assets/images/floral_arch_decor_1795344660354.jpg',
    display_order: 6,
    is_featured: 1,
  },
  {
    id: 'gal_7',
    title: 'Réception privée en villa à Bouskoura',
    caption: 'Ambiance nocturne chaleureuse pour anniversaire majeur et fête familiale.',
    category: 'Anniversaires',
    image_url: '/src/assets/images/hero_casablanca_gala_1795343965521.jpg',
    display_order: 7,
    is_featured: 0,
  },
  {
    id: 'gal_8',
    title: 'Soirée privée sous les arcades d’Anfa',
    caption: 'Terrasse illuminée au crépuscule avec salons lounge et lanternes en laiton.',
    category: 'Fêtes privées',
    image_url: '/src/assets/images/evening_soiree_cocktails_1795344660836.jpg',
    display_order: 8,
    is_featured: 1,
  },
];

export const INITIAL_TESTIMONIALS = [
  {
    id: 'test_1',
    client_name: 'Salma & Youssef B.',
    event_type: 'Mariage complet — Casablanca',
    city: 'Casablanca',
    quote_text:
      'Témoignage de démonstration : De la visite des jardins jusqu’au dernier morceau de musique, l’équipe EVENT PRO a orchestré chaque prestataire avec calme et précision. Nous avons pleinement profité de nos invités.',
    is_demo: 1,
    is_approved: 1,
  },
  {
    id: 'test_2',
    client_name: 'Direction Communication — Groupe financier (Casablanca)',
    event_type: 'Séminaire annuel & dîner de gala',
    city: 'Casablanca',
    quote_text:
      'Témoignage de démonstration : Devis détaillé dès le premier échange, régie audiovisuelle irréprochable pour nos 180 collaborateurs et dîner de gala livré à la minute près.',
    is_demo: 1,
    is_approved: 1,
  },
  {
    id: 'test_3',
    client_name: 'Kenza E.',
    event_type: 'Cérémonie de fiançailles & henné',
    city: 'Dar Bouazza',
    quote_text:
      'Témoignage de démonstration : L’équilibre entre l’artisanat marocain et la sobriété des fleurs blanches correspondait exactement à ce que nous imaginions pour notre soirée familiale.',
    is_demo: 1,
    is_approved: 1,
  },
];

export const INITIAL_SETTINGS = {
  id: 'default',
  company_name: 'EVENT PRO',
  slogan_fr: 'Vos événements, notre expertise. Vos moments, notre passion.',
  phone: '+212 5 22 00 00 00',
  whatsapp_number: '',
  email: 'contact@eventpro.ma',
  address: 'Casablanca & Grand Casablanca (Anfa, Ain Diab, Bouskoura, Dar Bouazza)',
  service_area: 'Casablanca, Bouskoura, Dar Bouazza, Mohammedia, Rabat',
  instagram_url: 'https://instagram.com',
  facebook_url: 'https://facebook.com',
  currency: 'MAD',
  booking_notice_fr:
    'Toute demande de réservation fait l’objet d’une étude personnalisée et d’un devis détaillé sous 24h ouvrées.',
  logo_url: '',
};
