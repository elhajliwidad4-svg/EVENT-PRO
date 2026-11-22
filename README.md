# EVENT PRO — Plateforme d’organisation et de réservation d’événements (Casablanca, Maroc)

Application web complète conçue pour **EVENT PRO** à Casablanca, prête pour un déploiement serverless sur **Cloudflare Pages + Cloudflare Pages Functions + Cloudflare D1 + Cloudflare R2 + Cloudflare Turnstile**.

---

## Architecture technique

- **Frontend** : React 19, TypeScript, Vite, Tailwind CSS v4, React Router (`src/`).
- **Backend API** : Cloudflare Pages Functions (`functions/api/[[path]].ts` & `functions/_lib/router.ts`) sans dépendance Node.js.
- **Base de données** : Cloudflare D1 (SQLite) avec migrations SQL (`migrations/0001_initial.sql`, `migrations/0002_seed.sql`).
- **Stockage média** : Cloudflare R2 (`R2_BUCKET`) pour les photos téléversées depuis l’administration (`/api/admin/upload` & `/api/media/*`).
- **Sécurité** :
  - Hachage des mots de passe côté serveur par `PBKDF2-SHA256` (Web Crypto API).
  - Jetons signés `HMAC-SHA256` transmis via `Authorization: Bearer` (conservés uniquement en mémoire JS).
  - Protection anti-spam Cloudflare Turnstile et limitation de débit par IP.
  - Contrôle d’accès strict client (`role === 'client'`) et administrateur (`role === 'admin'`).
- **Localisation** : Français par défaut (`Africa/Casablanca`, devise `MAD`, format `+212`), avec support architectural pour l’arabe (`RTL`).

---

## Déploiement sur Cloudflare (Guide en 10 étapes)

### 1. Installer les dépendances

```bash
npm install
```

Installer également Wrangler (CLI officielle Cloudflare) si ce n’est pas encore fait :

```bash
npm install -D wrangler
npx wrangler login
```

### 2. Lancer le projet en local

Pour tester l’interface, l’émulateur local D1/R2 et les parcours complets en développement :

```bash
npm run dev
```

Ou avec Wrangler en local contre une base D1 locale :

```bash
npm run build
npx wrangler pages dev dist --d1 DB=event_pro_db --r2 R2_BUCKET=event-pro-media
```

### 3. Créer la base de données Cloudflare D1

```bash
npx wrangler d1 create event_pro_db
```

Copiez l’identifiant `database_id` retourné et remplacez `REPLACE_WITH_YOUR_D1_DATABASE_ID` dans `wrangler.toml`.

### 4. Appliquer les migrations SQL sur D1

Pour la base locale Wrangler :

```bash
npx wrangler d1 migrations apply event_pro_db --local
```

Pour la base D1 en production :

```bash
npx wrangler d1 migrations apply event_pro_db --remote
```

### 5. Créer le bucket Cloudflare R2

```bash
npx wrangler r2 bucket create event-pro-media
```

Vérifiez que `bucket_name = "event-pro-media"` correspond dans `wrangler.toml`.

### 6. Configurer les variables d’environnement et secrets

Dans le tableau de bord Cloudflare Pages (**Settings → Environment variables**) ou via Wrangler :

- `SESSION_SECRET` *(secret obligatoire en production — chaîne aléatoire de 64 caractères minimum)*.
- `ADMIN_BOOTSTRAP_PASSCODE` *(secret optionnel pour verrouiller le mot de passe administrateur via environnement ; s’il n’est pas défini, l’écran `/admin` propose lors du premier accès la création sécurisée du compte administrateur unique)*.
- `TURNSTILE_SECRET_KEY` *(clé secrète Cloudflare Turnstile pour valider les formulaires côté serveur)*.
- `VITE_TURNSTILE_SITE_KEY` *(clé publique du site Turnstile, injectée au build Vite)*.

### 7. Connecter Cloudflare Pages à GitHub

1. Poussez ce dépôt sur GitHub.
2. Dans **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
3. Sélectionnez votre dépôt et configurez :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
4. Dans **Settings → Functions → Bindings**, vérifiez la liaison :
   - D1 Database : variable `DB` → `event_pro_db`
   - R2 Bucket : variable `R2_BUCKET` → `event-pro-media`

### 8. Déployer le site manuellement ou automatiquement

Chaque push sur la branche principale déclenche le déploiement automatique, ou manuellement via :

```bash
npm run build
npx wrangler pages deploy dist
```

### 9. Configurer un domaine personnalisé

Dans **Cloudflare Pages → Custom domains → Set up a custom domain**, ajoutez votre domaine (ex. `eventpro.ma` et `www.eventpro.ma`). Cloudflare gère automatiquement le DNS et le certificat TLS/SSL.

### 10. Tester le site déployé

1. Vérifiez `GET https://votre-domaine.ma/api/health` (doit retourner `{"ok":true,"timezone":"Africa/Casablanca","currency":"MAD"}`).
2. Accédez à `/admin` pour activer ou vous connecter au tableau de bord et configurez votre **numéro WhatsApp (+212)** dans **Paramètres**.
3. Soumettez une demande de réservation de test sur `/reserver`, vérifiez la réception de la référence `EP-RES-...` et son apparition dans `/admin`.
4. Créez un compte sur `/espace-client` et vérifiez le cloisonnement des dossiers.
5. Vérifiez l’aperçu imprimable PDF d’un devis et l’export CSV des réservations depuis `/admin`.
