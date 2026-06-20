# TOR2MEGA

Extension Tor Browser + backend + dashboard pour envoyer des vidéos vers Mega sans téléchargement local.

## Architecture

```
TOR2MEGA/
├── backend/            # Node.js + Express + BullMQ + PostgreSQL + Redis
├── dashboard/          # React + Vite + TailwindCSS (PWA)
├── extension/          # Firefox/Tor Browser extension (manifest v2)
├── extension-chrome/   # Chrome extension (manifest v3)
├── android/            # React Native (Expo) Android/iOS app
└── docker-compose.yml
```

## Prérequis

- Node.js 20+
- Docker & Docker Compose
- yt-dlp + ffmpeg (sur le PATH ou configurés dans `.env`)

## Installation

### 1. Base de données + Redis

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed          # crée admin@tor2mega.local / admin
npm run dev           # API sur http://localhost:3000
```

### 3. Dashboard

```bash
cd dashboard
npm install
npm run dev           # Dashboard sur http://localhost:5173
```

### 4. Extension Tor Browser

1. Ouvrir Tor Browser → `about:debugging`
2. "This Firefox" → "Load Temporary Add-on"
3. Sélectionner `extension/manifest.json`

### 5. Extension Chrome

1. Ouvrir Chrome → `chrome://extensions`
2. Activer "Developer mode"
3. "Load unpacked" → sélectionner `extension-chrome/`

### 6. Configuration extension

1. Ouvrir les options de l'extension
2. Configurer:
   - Backend API URL: `http://localhost:3000`
   - API Token: copier depuis Dashboard → Settings → API Token

### 7. PWA

Le dashboard est une PWA installable sur mobile/desktop:
- Ouvrir `http://localhost:5173` dans un navigateur
- "Install" / "Add to Home Screen"

### 8. Android App (V2)

```bash
cd android
npm install
npx expo start     # QR code pour Expo Go ou lancer sur émulateur
```

L'app utilise la même API REST. Configurer l'URL du backend sur l'écran de login.

## Utilisation

1. Naviguer dans Tor Browser
2. Clic droit sur une vidéo (mp4, webm, mkv, mov, m3u8)
3. "Send to Mega"
4. La vidéo est téléchargée par le backend et envoyée vers Mega
5. Suivre la progression dans le dashboard ou le popup de l'extension

## Mega File Request

La destination Mega par défaut est configurée sur:
`https://mega.nz/filerequest/bNDOuR4lSVo`

Ajouter/modifier des destinations dans le dashboard → Destinations.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/stats` | Dashboard stats |
| GET | `/api/downloads` | List downloads |
| POST | `/api/downloads` | Create download |
| GET | `/api/downloads/:id` | Get download |
| POST | `/api/downloads/:id/cancel` | Cancel download |
| DELETE | `/api/downloads/:id` | Delete download |
| GET | `/api/destinations` | List destinations |
| POST | `/api/destinations` | Create destination |
| PUT | `/api/destinations/:id` | Update destination |
| DELETE | `/api/destinations/:id` | Delete destination |
| GET | `/api/logs` | List logs |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |
| GET | `/api/team/members` | List team members |
| POST | `/api/team/invite` | Invite team member |
| DELETE | `/api/team/members/:id` | Remove team member |
| GET | `/api/billing/plan` | Get current plan |
| POST | `/api/billing/subscribe` | Change plan |
| GET | `/api/billing/usage` | Get usage stats |
| GET | `/api/api-keys` | List API keys |
| POST | `/api/api-keys` | Create API key |
| DELETE | `/api/api-keys/:id` | Delete API key |

## V2 — PWA + Android

- **PWA**: Dashboard installable avec offline support (service worker + cache)
- **Add URL**: Ajout manuel d'URL depuis le dashboard
- **Android**: React Native (Expo) avec login, dashboard, downloads, add URL
- Même API REST — aucune logique dupliquée

## V3 — SaaS Multi-Utilisateurs

- **Organizations**: Multi-tenant avec tables `organizations` + `team_members`
- **Plans**: Free / Pro / Team / Enterprise avec limites (downloads, storage, members)
- **Billing**: Intégration Stripe (configurer `STRIPE_SECRET_KEY`)
- **API Keys**: Clés API avec `x-api-key` header pour intégrations externes
- **Rate Limiting**: 100 req/min sur l'API publique
- **Team Management**: Invitation de membres, rôles admin/member

## Stack

- **Backend**: Node.js, TypeScript, Express, PostgreSQL, Redis, BullMQ, Socket.IO
- **Downloader**: yt-dlp, ffmpeg
- **Uploader**: megajs / Mega API
- **Dashboard**: React, Vite, TailwindCSS, lucide-react
- **Extension**: Firefox WebExtension API (manifest v2) + Chrome (manifest v3)
- **Mobile**: React Native (Expo) — Android/iOS
- **SaaS**: Multi-tenant, Stripe billing, API keys, rate limiting
