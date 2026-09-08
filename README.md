# Lumi

Application de rencontres (dating app) pensée pour le marché béninois — profils, matching, messagerie temps réel, notifications push, PWA installable.

Backend **Laravel 12** (API JSON + Sanctum) et frontend **React 19** (SPA via React Router, servie par Vite) dans un seul repo.

## Stack

- **Backend** : Laravel 12, PHP 8.2+, Sanctum (auth par token), Laravel Reverb (WebSocket), Firebase Admin (push FCM), Cloudinary (médias, avec repli sur stockage local si non configuré)
- **Frontend** : React 19, React Router 7, Tailwind CSS 4, Framer Motion, Vite 7
- **Base de données** : SQLite par défaut en local, Postgres/MySQL en production
- **Tests** : PHPUnit (tests Feature couvrant auth, onboarding, matching, messagerie, notifications)

## Prérequis

- PHP >= 8.2 avec les extensions usuelles Laravel
- Composer
- Node.js >= 20 et npm
- (Optionnel en local) Postgres si vous ne voulez pas de SQLite

## Installation

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate

# Base de données (SQLite par défaut)
touch database/database.sqlite
php artisan migrate --seed

npm run build   # ou `npm run dev` pendant le développement
php artisan serve
```

L'app est servie sur `http://localhost:8000` (ou le port choisi par `artisan serve`).

### Variables d'environnement importantes

Voir `.env.example` pour la liste complète. À configurer selon les besoins :

| Variable | Rôle |
|---|---|
| `BROADCAST_CONNECTION=reverb` + `REVERB_*` / `VITE_REVERB_*` | Temps réel (messagerie, matchs). Nécessite `php artisan reverb:start`. |
| `VITE_FIREBASE_*` + `VITE_FIREBASE_VAPID_KEY` | Notifications push (FCM). Le service worker `firebase-messaging-sw.js` est généré automatiquement au build à partir de ces variables — rien à committer. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Connexion via Google (Socialite). |
| `MAIL_MAILER` | `log` par défaut (les emails de vérification/réinitialisation atterrissent dans `storage/logs/laravel.log`) — passer à un vrai transport SMTP pour la livraison réelle. |
| `QUEUE_CONNECTION` | Les diffusions temps réel (messages, matchs, likes) passent toujours par un job de queue, même sans `ShouldQueue` explicite sur l'event. En production, un worker (`php artisan queue:work`) doit tourner en continu à côté de `reverb:start`, sinon le temps réel ne fonctionne pas. |

## Tests

```bash
php artisan test
```

39+ tests Feature couvrant l'inscription, la connexion, le mot de passe oublié, la vérification d'email, l'onboarding complet, l'algorithme de découverte (filtres, scoring), le swipe/matching, la messagerie et les notifications.

## Fonctionnalités principales

- **Onboarding en plusieurs étapes** : infos de base, intention de rencontre, centres d'intérêt, photos
- **Découverte / swipe** : algorithme de scoring (intention, distance, intérêts communs) avec exclusion des profils bloqués/signalés/déjà vus
- **Matching** : like simple, match mutuel, notifications en temps réel
- **Messagerie** : texte, photo, note vocale, statut lu/non-lu, temps réel via Reverb
- **Notifications** : in-app + push (FCM), deep-linking vers la bonne page au clic
- **Mode fantôme** : navigation invisible
- **Vérification de compte** : email (mode non bloquant) et profil (photo de vérification)
- **PWA** : installable sur mobile/desktop (`manifest.webmanifest`, service worker, mode hors-ligne basique)

## Structure du projet

Structure Laravel standard, avec le frontend React dans `resources/js/` :

```
app/                  Contrôleurs, modèles, events, notifications, services
resources/js/         SPA React (pages, composants, contexts, hooks, routes)
resources/css/        Styles Tailwind
routes/                api.php (API JSON), web.php, channels.php (broadcast auth)
database/              Migrations, seeders, factories
tests/Feature/          Tests d'intégration
public/                 Assets buildés, manifest PWA, service workers, icônes
vite.config.js          Build frontend + génération du service worker Firebase
```

## Notes de développement

- L'authentification API est basée sur des tokens Sanctum (SPA, pas de sessions côté frontend).
- Les uploads média passent par Cloudinary si configuré, sinon repli automatique sur un stockage local (`public/uploads/`, non versionné).
- Le genre est actuellement restreint à Homme/Femme (choix produit assumé).
