# FLive

Live football match broadcaster for amateur and youth clubs with no TV budget.

## What it does

Two user roles:
- **Reporter** — signs in, creates matches, runs the live broadcast dashboard (clock, events, score)
- **Viewer** — anonymous, watches a public match feed in real time via share link or QR code

## Quick start

```bash
cp .env.example .env.local   # fill in Firebase config + auth cookie secrets
npm install
npm run dev                  # http://localhost:3000
```

The app redirects to `/cs` (Czech primary locale). Switch to `/en` via the locale selector.

## Required environment variables

```env
# Firebase (all NEXT_PUBLIC_*)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Session cookie signing (generate two random 32-char strings)
AUTH_COOKIE_SIGNATURE_KEY_CURRENT=
AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS=
```

## Commands

```bash
npm run dev      # dev server (localhost:3000, hot reload)
npm run build    # production build + type-check
npm run lint     # ESLint
```

## Architecture in brief

| Concern | Approach |
|---------|----------|
| Auth (client) | Firebase Auth + React Context (`useAuth()`) |
| Auth (server) | HTTP-only session cookie via `next-firebase-auth-edge`, validated in middleware |
| Route protection | `src/middleware.ts` — `/dashboard/*` and `/broadcast/*` require a valid session cookie |
| Database | Firebase Firestore — all CRUD in `src/lib/firebaseServices.ts` |
| Real-time | `EventFeed.tsx` only — single `onSnapshot` listener |
| Offline | `flive_session` localStorage queue for reporters; match clock cached every 30 s |
| i18n | next-intl — Czech (`cs`) + English (`en`), locale in URL |

For full details see [CLAUDE.md](CLAUDE.md) and [STACK.md](STACK.md). For UI conventions see [APP_DESIGN.md](APP_DESIGN.md).

## Sibling project

[fcp-web](../fcp-web) — football club portal; shares conventions and design tokens.
