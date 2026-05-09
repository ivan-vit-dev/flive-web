# Stack & Architecture Conventions

Copy this file to a new project and update the project-specific sections (locale list, Firestore collections, env vars).
Everything else is a reusable convention — keep it consistent across projects.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 App Router | SSR + file-based routing |
| Language | TypeScript 5 | strict mode |
| UI components | shadcn/ui | Radix UI primitives + Tailwind |
| Styling | Tailwind CSS | CSS variables for all colors |
| Theme | next-themes | `attribute="class"`, dark/light |
| Icons | lucide-react | no other icon libs |
| State | Zustand | two stores: authStore + appStore |
| Forms | react-hook-form + zod | always pair together |
| Toasts | react-hot-toast | one `<Toaster>` in root layout |
| Charts | recharts | |
| i18n | next-intl | locale in URL path |
| Backend | Firebase (Auth + Firestore + FCM) | |
| PWA | manifest.json + sw.js + FCM | |

---

## Project Structure

```
src/
├── app/
│   └── [locale]/
│       ├── layout.tsx          # Mounts AuthProvider, ThemeProvider, Toaster
│       ├── auth/
│       │   ├── layout.tsx      # Guard: redirects authenticated users to dashboard
│       │   └── (login|register|reset)/
│       └── (protected)/
│           ├── layout.tsx      # Just renders <AppShell> — no server-side auth check
│           └── (pages)/
├── components/
│   ├── ui/                 # shadcn/ui components only — do not add custom components here
│   ├── providers/
│   │   └── AuthProvider.tsx
│   └── (feature folders)/
├── lib/
│   ├── firebase.ts         # Firebase init, exports auth, db, messaging
│   ├── firebaseServices.ts # All Firestore CRUD — no Firestore calls outside this file
│   └── utils.ts            # cn(), getFirebaseErrorMessage(), shared helpers
├── store/
│   ├── authStore.ts
│   └── appStore.ts
├── types/
│   └── index.ts            # All domain types in one file
├── hooks/                  # Custom React hooks
└── proxy.ts                # next-intl locale middleware (file is proxy.ts, not middleware.ts)
messages/
├── cs.json                 # Primary locale
└── en.json
public/
├── manifest.json
└── sw.js
```

---

## Routing

- All routes live under `src/app/[locale]/`.
- The middleware file is `src/proxy.ts` — it only handles locale detection via `next-intl`. No auth logic in middleware.
- Locale matcher: `/` and `/(cs|en)/:path*` (update locale list per project).
- Use `useRouter()` and `useParams()` from `next/navigation` for navigation.

---

## Auth Pattern

Auth is fully **client-side**. No Firebase Admin SDK, no session cookies, no server-side route protection.

**`AuthProvider`** (mounted in locale layout) is the single source of truth for auth state:
1. Listens to Firebase `onAuthStateChanged`.
2. Looks up the Firestore `users` doc by email.
3. Writes result to `useAuthStore` via `setUser`.
4. Does **not** create user docs — registration hook handles that explicitly.

**Route guards (client-side only):**
- **Protected routes:** `AppShell` checks `useAuth()`. While loading → spinner. If `!user` after load → `router.push(`/${locale}/auth/login`)`.
- **Auth pages:** `src/app/[locale]/auth/layout.tsx` checks `useAuth()`. If `user` is set → `router.push(`/${locale}`)`.

**Registration race condition** — `onAuthStateChanged` fires as soon as Firebase Auth creates the user, before the Firestore doc exists. Fix: after `createUser()` in the sign-up hook, immediately call `setUser(newUser)` before `router.push`. `AuthProvider` will overwrite with the same data once it resolves.

```ts
// authStore shape
{ user: User | null; loading: boolean; setUser; setLoading; logout }
```

---

## State Management

Two Zustand stores only — do not add a third store; extend `appStore` instead.

- **`useAuthStore`** — auth state only.
- **`useAppStore`** — all domain entity lists, granular add/update/delete actions, per-entity `loading` flags.

Data flow: Firestore → `firebaseServices.ts` → store setters → components.

**No real-time Firestore listeners.** Load data on demand (on page mount or user action), then write to the store.

---

## Firebase

```ts
// src/lib/firebase.ts exports
export { auth, db, messaging }
```

- `messaging` is browser-only — guard with `typeof window !== 'undefined'`.
- Fall back to placeholder config values when env vars are missing so the dev server starts without credentials.
- All Firestore reads/writes live in `firebaseServices.ts`. No Firestore imports in components or stores.

### Required env vars

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
```

### Firestore document conventions

- Every document has `createdAt` and `updatedAt` (Firestore `Timestamp`).
- Every user-owned document has a `userId` or `coachId` field for scoping queries.
- All domain types are defined in `src/types/index.ts`.

---

## UI Conventions

### Components

- Use **shadcn/ui** for all UI — Button, Input, Dialog, Card, Select, Tabs, etc.
- Never import from `@radix-ui/*` directly in feature code — always through the `src/components/ui/` wrappers.
- No MUI, no Ant Design, no Chakra.

### Theming

- Colors use CSS variables: `hsl(var(--primary))`, `hsl(var(--background))`, etc.
- Dark/light toggle via `next-themes` with `attribute="class"` on `<html>`.
- Never hardcode hex/rgb colors in components — always use Tailwind semantic tokens.

### Icons

- **lucide-react** only. One import style: `import { IconName } from 'lucide-react'`.

### Toasts

- `<Toaster>` is mounted once in the locale layout.
- Call `toast.success()` / `toast.error()` directly — no prop drilling.

### Forms

- Always use `react-hook-form` + `zod`. Define the schema first, derive the type from it.
- Render field errors inline below the input, not in a toast.

---

## Error Handling

Firebase Auth errors are mapped to user-friendly messages via `getFirebaseErrorMessage(error.code)` in `src/lib/utils.ts`. It covers Auth SDK errors (`auth/...`), REST API errors, and HTTP status codes. Always use it in catch blocks — never show raw Firebase error codes to users.

---

## PWA

- `public/manifest.json` — app metadata and icons.
- `public/sw.js` — service worker for offline support.
- `requestNotificationPermission()` in `src/lib/firebase.ts` — requests browser permission and returns the FCM token. Call it after the user is authenticated, not on page load.
