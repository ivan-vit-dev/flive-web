# FLive — App Design System

> Canonical reference for all UI/UX decisions. Consult before touching any component or page.
> Every section has exact Tailwind classes / CSS tokens that must be used.

---

## 1. Design Tokens

### Color (CSS custom properties — oklch color space)

| Token | Light value | Dark value | Purpose |
|---|---|---|---|
| `--primary` | `oklch(0.50 0.27 285)` | `oklch(0.72 0.27 285)` | Electric violet — brand color |
| `--primary-foreground` | `oklch(0.98 0 0)` | `oklch(0.10 0.01 285)` | Text on primary surfaces |
| `--background` | `oklch(0.99 0.003 285)` | `oklch(0.12 0.022 285)` | Page background |
| `--foreground` | `oklch(0.13 0.015 285)` | `oklch(0.95 0.005 285)` | Body text |
| `--card` | `oklch(1 0 0)` | `oklch(0.16 0.020 285)` | Card / panel surface |
| `--card-foreground` | same as foreground | same as foreground | Text on cards |
| `--muted` | `oklch(0.96 0.010 285)` | `oklch(0.20 0.018 285)` | Subdued surfaces, tab lists |
| `--muted-foreground` | `oklch(0.52 0.025 285)` | `oklch(0.62 0.020 285)` | Captions, labels, metadata |
| `--secondary` | `oklch(0.94 0.025 285)` | `oklch(0.22 0.025 285)` | Secondary action surfaces |
| `--accent` | `oklch(0.94 0.030 285)` | `oklch(0.24 0.025 285)` | Hover highlight, dropdown items |
| `--border` | `oklch(0.90 0.015 285)` | `oklch(1 0 0 / 9%)` | Borders everywhere |
| `--input` | `oklch(0.90 0.015 285)` | `oklch(1 0 0 / 12%)` | Input field border/fill |
| `--ring` | same as primary | same as primary | Focus rings |
| `--destructive` | `oklch(0.577 0.245 27)` | `oklch(0.65 0.22 25)` | Errors, delete actions |
| `--amber` | `oklch(0.78 0.18 72)` | `oklch(0.82 0.18 72)` | Live scores, live highlights |

> **Opacity modifiers do NOT work** (`bg-primary/50` → transparent). Use `color-mix(in oklch, var(--token) 50%, transparent)` in raw CSS for partial opacity. Tailwind opacity classes are blocked by oklch variable format.

### Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius` | `0.75rem` (12px) | Base reference |
| `rounded-sm` | 8px | Small chips, minor elements |
| `rounded-md` | 10px | Small inputs, icon buttons |
| `rounded-lg` | 12px | Buttons, inputs (default) |
| `rounded-xl` | 12px | Cards, panels, dialogs |
| `rounded-2xl` | 16px | Hero art, empty-state icons |
| `rounded-full` | pill | Status badges, avatars, live dot |

### Shadows

| Class | Use |
|---|---|
| `shadow-sm` | Inline elements, pills |
| `shadow-md` | Elevated cards, dropdowns |
| `shadow-lg` | Modals, popovers |
| `shadow-card-live` | Live match cards (violet tint) |
| `shadow-glow` | Hover on live cards, logo box hover |

### Gradient Utilities (defined in `globals.css`)

| Class | Description | Use |
|---|---|---|
| `.gradient-brand` | 135° violet → purple-pink | CTA buttons, active step indicators, logo box, avatar |
| `.gradient-text` | Same gradient clipped to text | App name "FLive", accent headings |
| `.gradient-hero` | Subtle violet+amber wash, low opacity | Hero section background only |
| `.glass` | Frosted glass (backdrop-blur 16px) | Sticky public header |

### Typography

| Use | Classes |
|---|---|
| Page heading | `text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl` |
| Section heading | `text-xl font-semibold` |
| Card title | `text-base font-medium leading-snug` |
| Body / default | `text-sm` |
| Caption / meta | `text-xs text-muted-foreground` |
| Score (large) | `text-5xl font-bold tabular-nums` |
| Score (compact) | `text-xl font-bold tabular-nums` |
| Team name | `text-lg font-semibold` (scoreboard), `text-sm font-medium` (card) |

---

## 2. Buttons

> Base component: `src/components/ui/button.tsx` wrapping `@base-ui/react/button`

### Variants

| Variant | When to use | Visual |
|---|---|---|
| `default` | Primary actions on regular pages | `bg-primary text-primary-foreground` |
| `gradient-brand` (add class) | **Top-level CTAs** — "New Match", submit forms, broadcast link, "View live" on cards | `gradient-brand text-white shadow-sm hover:opacity-90` |
| `outline` | Secondary actions, filters, "View" on non-live cards | `border border-border bg-transparent hover:bg-accent` |
| `ghost` | Tertiary / nav items / icon-only with no chrome | `hover:bg-accent hover:text-accent-foreground` |
| `destructive` | Delete, dangerous actions | `bg-destructive/10 text-destructive border border-destructive/20` |
| `secondary` | Supplementary actions | `bg-secondary text-secondary-foreground` |
| `link` | Inline text links | underline only, no background |

### Sizes

| Size | Height | Padding | Font | Use |
|---|---|---|---|---|
| `xs` | h-6 | px-2 | text-xs | Chips inside cards, event badges |
| `sm` | h-7 | px-2.5 | text-[0.8rem] | Secondary actions, table rows |
| `default` | h-8 | px-2.5 | text-sm | Default everywhere |
| `lg` | h-9 | px-2.5 | text-sm | Hero CTAs, form submits |
| `icon-xs` | 24×24 | — | — | Tight icon buttons |
| `icon-sm` | 28×28 | — | — | Secondary icon buttons |
| `icon` | 32×32 | — | — | Default icon button |
| `icon-lg` | 36×36 | — | — | Primary icon actions |

### Toggle Chips (Selection Buttons)

Used for: multi-select / single-select option groups — event type configuration, halves/parts selector.

| State | Classes |
|---|---|
| Selected | `rounded-full border border-transparent bg-primary text-primary-foreground px-3.5 py-1 text-sm transition-colors` |
| Unselected | `rounded-full border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent px-3.5 py-1 text-sm transition-colors` |

- **No gradient** — use solid `bg-primary` for selected state, never `gradient-brand`
- Hover on unselected shifts to accent surface so active vs focused states stay visually distinct
- Pill shape (`rounded-full`) distinguishes chips from regular rectangular buttons

### Rules

- Form submit buttons: always `w-full` + `.gradient-brand text-white`
- Settings add-action buttons (Add team, Add player, Add pitch, Add competition — both the section toggle and the inline form submit): `gradient-brand text-white border-0 shadow-sm hover:opacity-90 transition-opacity` — these are the primary CTA within their collapsible panel, not `outline`
- Destructive confirmation buttons: `variant="destructive"` inside a Dialog
- Icon-only buttons always include `<span className="sr-only">` for accessibility
- Focus state is automatic: `border-ring ring-3 ring-ring/50`
- Disabled: `opacity-50 pointer-events-none` — never remove this

---

## 3. Input Fields

> Base component: `src/components/ui/input.tsx`

### Standard Input

```
h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base
placeholder:text-muted-foreground
focus:border-ring focus:ring-3 focus:ring-ring/50
disabled:opacity-50 disabled:bg-input/50
dark:bg-input/30
```

### Textarea

Same visual as Input but `min-h-16 field-sizing-content` (grows with content).

### Select

Trigger styled identical to Input (`h-8` default, `h-7` for `sm`). Dropdown content uses `bg-popover border rounded-xl shadow-lg`. Items hover with `bg-accent text-accent-foreground`.

### Label

`text-sm font-medium leading-none select-none` — always sits directly above the field.

### Error message

`text-xs text-destructive` — directly below the field, no icon.

### Form layout pattern

```tsx
<form className="space-y-4">
  <div className="space-y-1.5">
    <Label />
    <Input />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
  <Button type="submit" size="lg" className="w-full gradient-brand text-white">
    Submit
  </Button>
</form>
```

---

## 4. Cards

> Base component: `src/components/ui/card.tsx`

### Generic Card

```
rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden flex flex-col gap-4 py-4
```
- `CardHeader` → `px-4`
- `CardContent` → `px-4`
- `CardFooter` → `px-4 py-3 bg-muted/50 border-t`

### Match Card (live)

```tsx
<Card className="border-border shadow-card-live hover:shadow-glow transition-all hover:-translate-y-0.5">
  <div className="h-0.5 w-full gradient-brand" />   {/* accent top bar */}
  {/* Score box */}
  <div className="rounded-xl px-3 py-1.5 bg-secondary">
    <p className="text-xl font-bold tabular-nums gradient-text">2 : 1</p>
  </div>
</Card>
```

### Match Card (non-live)

```tsx
<Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
  {/* Score box */}
  <div className="rounded-xl px-3 py-1.5 bg-muted">
    <p className="text-xl font-bold tabular-nums">2 : 1</p>
  </div>
</Card>
```

### Info / Status Card

Flat card for scoreboard, feed containers, progress timeline:
```
rounded-xl border bg-card
```
No ring, no shadow — just border.

### Empty State

```tsx
<div className="flex flex-col items-center gap-3 py-12 text-center">
  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
    <Icon className="h-6 w-6 text-muted-foreground" />
  </div>
  <p className="text-sm text-muted-foreground">No matches yet</p>
</div>
```

---

## 5. Badges

> Base component: `src/components/ui/badge.tsx`

All badges use `rounded-full` (pill shape) — never `rounded-lg` or any other partial radius.

| Variant | Use | Visual |
|---|---|---|
| `default` | Primary label | `bg-primary text-primary-foreground` |
| `secondary` | Neutral / info | `bg-secondary text-secondary-foreground` |
| `outline` | Subtle label | border only, transparent bg |
| `destructive` | Error / warning | `bg-destructive/10 text-destructive` |
| `ghost` | Very subtle tag | transparent + hover |

### Match Status Badge (custom)

`src/components/match/MatchStatusBadge.tsx`

| Status | Classes |
|---|---|
| `live` | `bg-amber text-amber-foreground` + live-pulse dot |
| `upcoming` | `variant="secondary"` |
| `finished` | `variant="outline"` |
| `cancelled` | `variant="destructive"` |

### Live Pulse Dot

```tsx
<span className="h-1.5 w-1.5 rounded-full bg-current animate-live-pulse" />
```

---

## 6. Dialogs / Modals

> Base component: `src/components/ui/dialog.tsx`

- Overlay: `bg-black/10 backdrop-blur-sm fixed inset-0 z-50`
- Content: `rounded-xl bg-card border shadow-lg max-w-sm w-full p-0`
- Header: `px-4 pt-4 pb-0`
- Body: `px-4 py-4`
- Footer: `px-4 py-3 border-t bg-muted/50 flex justify-end gap-2`
- Close button: `variant="ghost" size="icon-sm"` top-right corner
- Confirm button: `gradient-brand text-white`
- Cancel button: `variant="outline"`

---

## 7. Navigation

### Public Header (`src/components/layout/PublicHeader.tsx`)

```
sticky top-0 z-50 w-full border-b border-border glass
inner: max-w-5xl mx-auto px-4 h-14 flex items-center justify-between
```

- Logo box: `h-8 w-8 rounded-xl gradient-brand text-white shadow-md`
- App name: `text-lg font-bold gradient-text`
- Nav links: `text-sm text-muted-foreground hover:text-foreground rounded-lg px-3 py-1.5`
- Active link: `text-foreground bg-accent`
- CTA button: `variant="outline" size="sm"` (Sign in) or avatar badge

### Dashboard Sidebar (`src/components/layout/AppSidebar.tsx`)

```
bg-sidebar border-r border-sidebar-border w-64
```

- Nav items: `text-sm rounded-lg px-3 py-1.5 text-sidebar-foreground hover:bg-sidebar-accent`
- Active: `bg-sidebar-accent text-sidebar-accent-foreground font-medium`
- Section label: `text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-1`

### Dashboard Top Bar (`src/components/layout/AppTopbar.tsx`)

```
border-b border-border h-14 px-4 flex items-center justify-between
```

### Mobile Bottom Nav (`src/components/layout/AppBottomNav.tsx`)

```
fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/80 backdrop-blur-sm
```
- Items: icon + label, centered, `text-xs`
- Active: `text-primary`
- Inactive: `text-muted-foreground`

---

## 8. Tabs

> Base component: `src/components/ui/tabs.tsx`

### Variant: `default`

```
TabsList: rounded-lg bg-muted p-0.5
TabsTrigger: rounded-md text-sm text-muted-foreground px-3 py-1
Active: bg-background text-foreground shadow-sm dark:bg-input/30
```
Used for: Dashboard (Live / Upcoming / Finished)

### Variant: `line`

```
TabsList: border-b border-border gap-0 rounded-none bg-transparent p-0
TabsTrigger: border-b-2 border-transparent rounded-none px-4 py-2
Active: border-primary text-foreground
```
Used for: Detailed views with multiple sub-sections

---

## 9. Match-Specific Components

### MatchCard Row (`src/components/match/MatchCard.tsx`)

The primary match list item — used on the home page and in the dashboard. **Not** a `Card` component; it is a plain `div` row rendered inside a bordered list container:

```tsx
<div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
  {matches.map((m, i) => <MatchCard key={m.id} match={m} variant="…" index={i} />)}
</div>
```

Row alternates background by index: even → `bg-card`, odd → `bg-muted`. Live matches add a left accent: `border-l-2 border-primary`.

#### Props

| Prop | Type | Notes |
|---|---|---|
| `match` | `Match` | The match document |
| `variant` | `"public" \| "reporter"` | Controls which actions are shown |
| `index` | `number` | For alternating row backgrounds |
| `onRefresh` | `() => void` | Called after cancel to refresh the list |

#### `public` variant — home page

```
[MatchStatusBadge] [home · score · away] [competition · time] [copy] [cancel?] [›]
```

- Copy link button: always visible (`Copy` icon, `text-muted-foreground hover:text-foreground`)
- **Cancel button** (`Ban` icon): only shown when `user.uid === match.reporterId && match.status === "scheduled"` — owner-only, invisible to anonymous viewers or other reporters
- Chevron `›`: always rightmost, non-interactive

#### `reporter` variant — dashboard

```
[MatchStatusBadge] [home · score · away] [competition · time] [copy] [duplicate] [cancel?] [edit] [▶]
```

- All actions always visible (same icon button style)
- Cancel (`Ban` icon): only shown when `match.status === "scheduled"`
- Edit (`Settings` icon): links to `dashboard/match/[id]/edit`
- Play (`Play` icon): links to `dashboard/match/[id]`; uses `gradient-brand text-white` when live, `text-muted-foreground` otherwise

#### Action icon button style (both variants)

```tsx
<button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
  <Icon className="h-3.5 w-3.5" />
</button>
```

Cancel specifically: `hover:text-destructive` instead of `hover:text-foreground`.

#### Cancel confirmation dialog

Triggered by the `Ban` icon in either variant. Uses the standard Dialog pattern (Section 6) with:

- Title: `dashboard.cancelConfirmTitle`
- Description: `dashboard.cancelConfirmDesc`
- Footer: `Back` (`variant="outline"`) + `Cancel match` (`bg-destructive text-destructive-foreground`)
- After confirm: `cancelMatch(match.id)` → `onRefresh?.()` → dialog closes

In the `public` variant the dialog is conditionally rendered only when `isOwner` is true.

---

### ScoreBoard

```tsx
<div className="rounded-xl border bg-card p-6 text-center space-y-3">
  <MatchStatusBadge />
  <div className="flex items-center justify-center gap-4">
    <p className="text-lg font-semibold">{homeTeam}</p>
    <div className="flex items-center gap-2 text-5xl font-bold tabular-nums">
      <span>{homeScore}</span>
      <span className="text-3xl text-muted-foreground">:</span>
      <span>{awayScore}</span>
    </div>
    <p className="text-lg font-semibold">{awayTeam}</p>
  </div>
</div>
```

### Match Progress Timeline

```tsx
// Step states:
completed: "bg-muted/60 text-muted-foreground"
active:    "gradient-brand text-white shadow-sm animate-live-pulse"
upcoming:  "border border-border/50 text-muted-foreground/50"
// Connector:
"h-px flex-1 bg-border"
```

### Event Feed Item

No dividing lines — rows are visually separated by alternating backgrounds (`bg-muted` on even, transparent on odd). List uses `p-1.5 space-y-0.5`.

| Row type | Layout | Background |
|---|---|---|
| Home team event | left: minute · badge · details — right: remove button | alternating |
| Away team event | left: remove button — details · badge · minute :right | alternating |
| No-team gameplay | centered: minute · badge · label · remove button | alternating |
| Timeline / structural | centered: badge · label · remove button (absolute right) | `bg-secondary` always |

- Each row: `rounded-lg px-3 py-2`
- Remove button: `X` icon, `text-muted-foreground hover:text-destructive`, appears on every row
- Score-affecting events (goal, own_goal, penalty_scored, penalty_kick) automatically reverse the score counter on delete

### Broadcast Share Panel

Placed at the top of the broadcast page content area, above ScoreBoard. Lets the reporter share the live URL with viewers.

```tsx
<div className="rounded-xl border bg-card p-4 space-y-3">
  <div className="flex items-center justify-between gap-4">
    <p className="text-sm font-medium text-muted-foreground">{t("broadcast.shareWith")}</p>
    <div className="flex gap-2 shrink-0">
      {/* Copy Link — primary CTA */}
      <Button size="sm" className="gradient-brand text-white shadow-sm hover:opacity-90 transition-opacity gap-2">
        <Copy className="h-4 w-4" />
        {t("common.copyLink")}
      </Button>
      {/* QR toggle — secondary */}
      <Button variant="outline" size="sm" className="gap-2">
        <QrCode className="h-4 w-4" />
        QR
      </Button>
    </div>
  </div>
  {/* QR code expands inline below the button row when toggled */}
  <div className="flex justify-center pt-1 pb-2">
    <QRCodeSVG value={url} size={180} />
  </div>
</div>
```

- Panel: `rounded-xl border bg-card` — Info/Status card style, no ring or shadow
- Copy Link uses `gradient-brand text-white` — primary sharing action / CTA
- QR uses `variant="outline"` — secondary toggle; QR code renders inline inside the panel, not below it
- Label uses `text-sm font-medium text-muted-foreground`; i18n key `broadcast.shareWith`

---

### Live Control Panel Buttons

Event type buttons (GAMEPLAY_EVENTS grid):
```tsx
<div className="grid grid-cols-4 gap-2">
  <Button variant="outline" size="sm" className="flex-col h-auto py-2 gap-1 w-full rounded-xl">
    <EventIcon className="h-4 w-4" />
    <span className="text-xs">{label}</span>
  </Button>
</div>
```
- Grid layout: `grid-cols-4` — all buttons same width, row fills full container width
- Corner radius: `rounded-xl` — rounder than default buttons to visually distinguish event tiles from action buttons

Structural event buttons (start/end match, etc.):
```tsx
<Button className="gradient-brand text-white shadow-md" size="lg">
  {label}
</Button>
```

Destructive match controls (cancel, forfeit):
```tsx
<Button variant="destructive" size="sm">{label}</Button>
```

---

## 10. Page-Level Layout

### All public pages

```tsx
<main className="min-h-screen bg-background">
  <PublicHeader />
  <div className="mx-auto max-w-5xl px-4 py-8">
    {/* page content */}
  </div>
</main>
```

### Hero section

```tsx
<div className="relative overflow-hidden border-b border-border">
  <div className="absolute inset-0 gradient-hero" />
  <div className="relative mx-auto max-w-5xl px-4 py-10 sm:py-14">
    {/* pill subtitle badge */}
    <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm mb-5">
      <Icon className="h-3.5 w-3.5 text-primary" />
      Subtitle
    </div>
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-3">
      Heading
    </h1>
    <p className="text-muted-foreground text-lg max-w-2xl">Sub-copy</p>
  </div>
</div>
```

### Match grid (responsive)

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {matches.map(m => <MatchCard key={m.id} match={m} />)}
</div>
```

### Dashboard layout

```tsx
<AppShell>
  <div className="p-4 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">Page Title</h1>
      <Button className="gradient-brand text-white">Action</Button>
    </div>
    {/* content */}
  </div>
</AppShell>
```

---

## 11. Auth Pages

Centered card on a gradient-hero background:

```tsx
<div className="min-h-screen flex items-center justify-center gradient-hero px-4">
  <Card className="w-full max-w-sm p-6 space-y-6">
    <div className="text-center space-y-1">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="text-sm text-muted-foreground">Caption</p>
    </div>
    <LoginForm />
    <p className="text-center text-sm text-muted-foreground">
      No account? <Link className="text-primary underline">Register</Link>
    </p>
  </Card>
</div>
```

---

## 12. Accessibility & Interaction Conventions

- Focus ring: automatic via `ring-3 ring-ring/50` on all interactive elements
- Hover transitions: `transition-all duration-200` on cards, `transition-colors` on buttons/links
- Card hover lift: `hover:-translate-y-0.5` on clickable cards
- Disabled state: `opacity-50 pointer-events-none` — never change this
- Loading spinner: inline inside button, replaces label text — never block the whole page
- `sr-only` on all icon-only interactive elements
- Offline indicator: `WifiOff` icon + muted text — never use a blocking overlay

---

## 13. i18n Conventions

- Every user-facing string comes from `useTranslations()` — no hardcoded English
- Locale is always in the URL: `/[locale]/...`
- `Link href` always includes locale prefix via next-intl `Link`
- `router.push` calls use locale-prefixed paths

---

## File Locations

| File | Purpose |
|---|---|
| `src/app/globals.css` | All CSS tokens, gradient classes, glass, scrollbar |
| `tailwind.config.ts` | Token mappings, animations, container |
| `src/components/ui/` | All base UI primitives |
| `src/components/match/` | Match-specific components |
| `src/components/layout/` | Navigation shell components |
| `src/components/forms/` | Form components with validation |
| `src/types/index.ts` | Event type definitions |
| `src/lib/firebaseServices.ts` | All Firestore reads/writes |
| `src/lib/utils.ts` | Broadcast session helpers |
| `PRESENTATION.html` | Standalone app presentation page (features, tech stack, architecture) |
