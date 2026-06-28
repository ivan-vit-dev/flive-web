# FLive — Stack & Architecture Reference

This document describes the **actual** technology choices and conventions used in this project. For AI guidance (quirks, constraints, decisions), see `CLAUDE.md`.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI primitives | shadcn/ui + @base-ui/react |
| Styling | Tailwind CSS v3 with oklch CSS custom properties |
| Icons | lucide-react |
| Auth (client) | Firebase Auth v10 via React Context (`AuthProvider`) |
| Auth (server) | next-firebase-auth-edge — HTTP-only session cookie, validated in middleware |
| Database | Firebase Firestore v10 |
| i18n | next-intl — locales: `cs` (primary), `en` |
| Forms | react-hook-form + zod |
| Notifications | react-hot-toast |
| PWA | manifest.json + service worker |

---

## Authentication

Two-layer auth — never use one without the other:

### Client layer — Firebase Auth + React Context
- `AuthProvider` (`src/components/providers/AuthProvider.tsx`) listens to `onAuthStateChanged`
- On auth change → fetches `users/{uid}` from Firestore → stores in `useState`
- Exposes `useAuth()` → `{ user, loading, setUser, logout }`
- `logout()` calls `/api/auth/logout` to clear the cookie, then Firebase `signOut()`

### Server layer — session cookie
- After sign-in, the page POSTs to `/api/auth/login` with `Authorization: Bearer <idToken>`
- `src/middleware.ts` (via `next-firebase-auth-edge`) intercepts this, creates a signed HTTP-only `session` cookie
- On every subsequent request, middleware validates the cookie
- `/dashboard/*` and `/broadcast/*` redirect to `/{locale}/auth/login` if cookie is missing/invalid
- Authenticated users are redirected away from `/auth/*` paths server-side

### Required env vars
```
AUTH_COOKIE_SIGNATURE_KEY_CURRENT   # random 32-char secret
AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS  # previous key (for rotation)
```

---

## Project Structure

```
src/
├── app/
│   └── [locale]/           # All routes locale-prefixed
│       ├── layout.tsx       # Root layout — AuthProvider, NextIntlClientProvider, ThemeProvider
│       ├── page.tsx         # Public match list (client component)
│       ├── auth/            # Login, register — thin server layout
│       ├── match/[id]/      # Public viewer (anonymous)
│       ├── broadcast/[id]/  # Reporter broadcast page
│       └── dashboard/       # Protected reporter area
├── components/
│   ├── ui/                  # shadcn/ui + Base UI wrappers (Button, Input must use forwardRef)
│   ├── providers/           # AuthProvider
│   ├── layout/              # PublicHeader, AppShell, AppSidebar, AppTopbar, AppBottomNav
│   ├── forms/               # LoginForm, RegisterForm, MatchForm, EventForm
│   └── match/               # MatchCard, EventFeed (only onSnapshot here), LiveControlPanel
├── lib/
│   ├── firebase.ts          # Firebase init — exports auth, db
│   ├── firebaseServices.ts  # ALL Firestore CRUD (no Firestore calls outside this file)
│   └── utils.ts             # cn(), getFirebaseErrorMessage(), broadcast session helpers
├── types/
│   └── index.ts             # All domain types in one file
├── i18n/
│   └── request.ts           # next-intl server config
└── proxy.ts                 # next-intl locale routing + next-firebase-auth-edge session guard (Next.js 16: proxy.ts replaces middleware.ts)
```

---

## State Management

No Zustand. The only global state is auth:
- **Server**: HTTP-only session cookie managed by middleware
- **Client**: `AuthProvider` React Context — `user`, `loading`, `setUser`, `logout`

All other state is local component state or derived from Firestore on mount.

---

## Data & Real-time

- All Firestore reads/writes are centralized in `src/lib/firebaseServices.ts`
- No Firestore imports in components or pages
- **`EventFeed.tsx` is the only component that uses `onSnapshot`** — do not add real-time listeners elsewhere
- All other data loading is one-time `getDoc`/`getDocs` on mount

---

## Offline Resilience (Reporters)

When a reporter loses connectivity during a broadcast, events are queued in `localStorage` under the key `flive_session` (type `BroadcastSession`). On reconnect, they are flushed to Firestore. The `flive_session` key also caches the running match clock (saved every 30 s with a wall-clock timestamp, restored on reload). Helpers in `src/lib/utils.ts`:

```ts
getBroadcastSession()
setBroadcastSession(session)
clearBroadcastSession()
saveMatchClock(seconds)
clearMatchClock()
```

Do not use Firebase offline persistence — the session queue is the strategy.

---

## Styling

- Tailwind with `oklch(...)` CSS custom properties — **opacity modifiers do not work** (`bg-primary/50` fails)
- Use `color-mix(in oklch, var(--token) 50%, transparent)` for transparency
- Gradient utilities in `globals.css`: `.gradient-brand`, `.gradient-text`, `.gradient-hero`, `.shadow-card-live`, `.glass`
- Cards: `rounded-xl` outer, `rounded-lg` for inner items
- Consult `APP_DESIGN.md` before touching any UI — it has exact Tailwind classes for every component

---

## i18n

- Middleware: `src/middleware.ts`
- Config: `src/i18n/request.ts`
- Locales: `cs` (primary), `en`
- Messages: `messages/cs.json`, `messages/en.json`
- All strings via `useTranslations()`; URL always includes locale: `/[locale]/...`

---

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # production build
npm run lint     # ESLint (flat config: eslint.config.mjs)
```

No test suite exists.
