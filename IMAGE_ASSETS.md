# FLive — Visual Asset Audit & AI Generation Plan

## Context

FLive has no image assets whatsoever — no favicon, no logo image, no PWA icons, no illustrations, no event icons beyond generic lucide-react SVGs. The app is functionally complete but visually generic. This plan audits every page and component for image/icon opportunities, defines the full asset list with correct sizes, and provides a ready-to-use AI generation prompt.

**Brand identity:** Electric violet (`oklch(0.50 0.27 285)` → `oklch(0.58 0.28 310)` purple-pink gradient), dark backgrounds, glassmorphism, amateur/youth football context.

---

## Page-by-Page Visual Opportunities

### 1. Home Page (`/[locale]/`)
- **Hero background** — currently `gradient-hero` CSS wash only. Opportunity: a subtle pitch-top-down or stadium-lights photo/illustration as a textured overlay behind the hero text, low opacity so text stays readable.
- **Empty state illustration** — "No matches today" uses a `Zap` lucide icon. Replace with a small football/pitch illustration.
- **Section dividers** — "Live", "Upcoming", "Finished Today" section headers are plain text. Could have a small icon per section (live pulse ball, clock, whistle).

### 2. Match Viewer (`/[locale]/match/[id]`)
- **No-data / loading illustration** — plain text "No Data". Could be a football-with-magnifying-glass illustration.
- **QR code container** — already functional. No changes needed visually.

### 3. Broadcast Page (`/[locale]/broadcast/[id]`)
- **Live broadcast hero accent** — the share card is plain. A subtle animated "LIVE" badge illustration or broadcast tower icon would reinforce the live feel.
- **No-data illustration** — same as match viewer.

### 4. Login Page (`/[locale]/auth/login`)
- **Logo** — currently a `Radio` lucide icon inside a gradient square. Replace with the actual FLive logo SVG/PNG.
- **Auth background** — uses `gradient-hero` full-screen. Could add a very low-opacity football texture or pitch lines pattern.

### 5. Register Page (`/[locale]/auth/register`)
- Same as Login — logo and background.

### 6. Dashboard Home (`/[locale]/dashboard`)
- **Empty state per tab** — three tabs (Live, Upcoming, Finished) each show a `Zap` icon + text. Dedicated small illustrations per state would be better (e.g., a whistle for "no live matches", a calendar for "no upcoming matches", a trophy for "no finished matches").

### 7. New Match / Edit Match Pages
- No image opportunity — form-heavy, keep clean.

### 8. Match Control (Live Control Panel) — `/[locale]/dashboard/match/[id]`
- **Offline banner** — WifiOff lucide icon is fine. No change needed.
- **Event type buttons** — 22 gameplay events use generic lucide icons (e.g., `CircleDot` for goal, `Square` for cards). Custom sport-specific SVG icons would be the biggest UX upgrade in the whole app.

### 9. Settings Page
- **Team avatar placeholder** — teams have no avatar. A default team shield/crest placeholder graphic would look polished.

### 10. AppTopbar / AppSidebar / PublicHeader (global)
- **Logo** — all three use `Radio` lucide icon inside a `gradient-brand` box. Replace with FLive logo SVG.
- **User avatar** — currently gradient + initials. Could support uploaded photo later, but initials is fine for now; no action needed.

---

## Complete Asset List

### A. Logo & Brand

| Asset | Format | Size | Usage |
|---|---|---|---|
| `logo-icon.svg` | SVG | 1:1 scalable | App icon in header, sidebar, auth pages |
| `logo-full.svg` | SVG | ~160×40px | Optional wide variant (future marketing page) |
| `logo-icon-white.svg` | SVG | 1:1 scalable | Light-on-dark contexts |

### B. Favicon & PWA Icons (required for PWA compliance)

| Asset | Format | Size | Usage |
|---|---|---|---|
| `favicon.ico` | ICO | 16×16, 32×32, 48×48 (multi-size) | Browser tab |
| `favicon-16x16.png` | PNG | 16×16 | Legacy browsers |
| `favicon-32x32.png` | PNG | 32×32 | Standard browser tab |
| `apple-touch-icon.png` | PNG | 180×180 | iOS home screen |
| `icon-192.png` | PNG | 192×192 | Android PWA icon |
| `icon-512.png` | PNG | 512×512 | Android PWA splash / store |
| `icon-maskable-512.png` | PNG | 512×512 | Android adaptive icon (safe zone: inner 409×409) |
| `og-image.png` | PNG | 1200×630 | Open Graph / social share preview |

### C. Event Type Icons (SVG, sport-specific)

All 22 gameplay events need custom SVG icons (24×24 viewBox, single-color/currentColor so they inherit Tailwind color classes):

| Icon slug | Event(s) | Visual concept |
|---|---|---|
| `event-goal.svg` | `goal` | Football in net |
| `event-own-goal.svg` | `own_goal` | Football in own net (arrow reversed) |
| `event-yellow-card.svg` | `yellow_card` | Yellow rectangle card |
| `event-second-yellow.svg` | `second_yellow` | Yellow + red card stacked |
| `event-red-card.svg` | `red_card` | Red rectangle card |
| `event-substitution.svg` | `substitution` | Two arrows (up/down) with player silhouette |
| `event-corner.svg` | `corner` | Corner flag |
| `event-free-kick.svg` | `free_kick` | Boot kicking ball |
| `event-penalty-awarded.svg` | `penalty_awarded` | Penalty spot dot + D-arc |
| `event-penalty-scored.svg` | `penalty_scored` | Ball in bottom corner of goal |
| `event-penalty-missed.svg` | `penalty_missed` | Ball going wide of post |
| `event-penalty-kick.svg` | `penalty_kick` | Boot + ball + goal |
| `event-offside.svg` | `offside` | Two player silhouettes + line |
| `event-foul.svg` | `foul` | Referee whistle |
| `event-injury.svg` | `injury` | Medical cross / stretcher |
| `event-injury-time.svg` | `injury_time_announced` | Clock + plus sign |
| `event-shot-on.svg` | `shot_on_target` | Ball → goal (on target arrow) |
| `event-shot-off.svg` | `shot_off_target` | Ball → post/bar (miss arrow) |
| `event-save.svg` | `save` | Goalkeeper glove blocking ball |
| `event-var.svg` | `var_review` | Video screen / monitor |
| `event-var-disallowed.svg` | `var_goal_disallowed` | Video screen + X |
| `event-var-confirmed.svg` | `var_goal_confirmed` | Video screen + check |
| `event-note.svg` | `custom_note` | Speech bubble / notepad |

### D. Structural Event Icons (SVG, 24×24)

| Icon slug | Event | Visual concept |
|---|---|---|
| `event-kickoff.svg` | `match_start`, `second_half_start` | Whistle blow |
| `event-half-time.svg` | `first_half_end` | Referee + half-time board |
| `event-full-time.svg` | `full_time` | Final whistle + hands up |
| `event-extra-time.svg` | `extra_time_start`, `extra_time_end` | Clock going past 90 |
| `event-shootout.svg` | `penalty_shootout_start` | Goalkeeper spread arms |
| `event-finished.svg` | `match_finished` | Trophy / medal |

### E. Illustrations (for empty states)

| Asset | Format | Size | Page / context |
|---|---|---|---|
| `empty-no-matches.svg` | SVG | ~200×160px | Home page — no matches today |
| `empty-no-live.svg` | SVG | ~160×130px | Dashboard live tab — no live matches |
| `empty-upcoming.svg` | SVG | ~160×130px | Dashboard upcoming tab |
| `empty-finished.svg` | SVG | ~160×130px | Dashboard finished tab |
| `empty-no-data.svg` | SVG | ~160×130px | Match viewer / broadcast — not found |

### F. Background / Texture (optional, low priority)

| Asset | Format | Size | Usage |
|---|---|---|---|
| `pitch-texture.svg` | SVG | tileable | Auth page hero background overlay (5–10% opacity) |
| `pitch-lines.svg` | SVG | 1440×400px | Home hero section wash |

---

## AI Image Generation Prompt

### Context block (paste at the top of every generation session)

```
CONTEXT — FLive app brand:
FLive is a live football (soccer) match broadcaster for amateur and youth clubs. It is a clean, modern progressive web app. 

Brand personality: sporty, energetic, professional but approachable. Not elite/commercial — this is grassroots football.

Color palette:
- Primary: electric violet (#6B21E8 approximately, oklch-based)
- Gradient: violet → purple-pink (135° direction)
- Backgrounds: near-white (light mode) or very dark violet-tinted (#1A1625 approximately, dark mode)
- Accent: amber/gold for "live" states
- Red for cards/danger

Visual style:
- Clean, minimal, geometric
- Glassmorphism surfaces (frosted glass cards)
- Rounded corners (12–16px radius)
- Supports both light and dark themes — assets should work on both
- No photorealism — flat or semi-flat vector preferred
- Icons: single-weight outline or filled, consistent stroke width
```

### Per-asset prompts

**Logo icon (`logo-icon.svg`)**
```
Minimal logo icon for "FLive" football broadcasting app. 
Concept: a football (soccer ball) combined with a broadcast/radio wave signal. 
The ball should be stylized, not realistic — geometric pentagon pattern. 
Broadcast waves radiate from the ball (like WiFi arc lines but curved around ball top).
Style: flat vector, single violet color (#6B21E8), suitable for use at 16px–512px.
Output: SVG, square canvas, no text, no background.
```

**Favicon / app icon (raster versions)**
```
App icon for FLive — a football broadcasting PWA.
Square canvas with rounded corners (for iOS). 
Gradient background: violet (#6B21E8) → purple-pink (#9333EA), top-left to bottom-right.
Centered white logo: football + broadcast waves (same as logo-icon.svg but white/light).
Style: clean, modern, no text.
Sizes needed: 16, 32, 180, 192, 512px (generate at 512px, export smaller).
```

**OG image (`og-image.png`)**
```
Open Graph social preview image for FLive app.
Size: 1200×630px.
Left half: App logo (football + broadcast waves) large, white, centered vertically.
Right half: App name "FLive" in bold white sans-serif, subtitle "Live Football for Everyone" smaller below.
Background: diagonal gradient from deep violet (#4C1D95) top-left to purple-pink (#9333EA) bottom-right.
Optional: very subtle pitch line pattern at 8% opacity overlay.
Style: clean, bold, modern. No photorealism.
```

**Event icons (sport SVGs — generate as a set)**
```
Design a consistent icon set for football match events. 
Style rules for ALL icons:
- 24×24 viewBox (or 0 0 24 24)
- Outline/stroke style, stroke-width: 1.5–2px
- currentColor (single color, no hardcoded colors)
- Rounded line caps and joins
- Minimal detail — readable at 20px
- Consistent visual weight across all icons

Generate these icons one per prompt or as a described set:
[paste individual icon name + concept from Section C above]
```

**Empty state illustrations**
```
Small editorial illustration for a football app empty state.
Concept: [describe specific empty state, e.g. "no live matches — referee looking at empty pitch"]
Style: flat vector illustration, 2–3 colors max using violet/purple palette + amber accent.
Mood: friendly, light, slightly playful.
Canvas: 200×160px SVG, centered composition with breathing room.
No text in the illustration itself (text is added by the app).
```

**Auth page pitch texture**
```
Seamless tileable SVG pattern of football pitch top-down markings.
Elements: center circle, halfway line, penalty areas, corner arcs.
Style: ultra-minimal, single color (white or violet), very low visual weight.
Intended use: background overlay at 5–8% opacity over a gradient.
Canvas: 400×400px tile that repeats seamlessly.
No fills, stroke only, thin lines (0.5–1px equivalent).
```

---

## Implementation Notes (for when assets are ready)

1. **Favicon wiring** — add `<link rel="icon">` tags in [src/app/layout.tsx](src/app/layout.tsx) metadata and populate the `icons[]` array in [public/manifest.json](public/manifest.json).
2. **Fix manifest theme_color** — change `"#166534"` (green) to `"#6B21E8"` (violet) in [public/manifest.json](public/manifest.json).
3. **Event icons** — replace lucide imports in [src/components/match/EventBadge.tsx](src/components/match/EventBadge.tsx) with the custom SVG components.
4. **Logo** — replace `Radio` icon references in [src/components/layout/AppTopbar.tsx](src/components/layout/AppTopbar.tsx), [src/components/layout/AppSidebar.tsx](src/components/layout/AppSidebar.tsx), [src/components/layout/PublicHeader.tsx](src/components/layout/PublicHeader.tsx), and both auth pages with the `<Image>` logo component.
5. **Empty states** — [src/app/[locale]/page.tsx](src/app/%5Blocale%5D/page.tsx) and [src/app/[locale]/dashboard/page.tsx](src/app/%5Blocale%5D/dashboard/page.tsx) empty state blocks.
6. **OG image** — referenced via metadata in [src/app/[locale]/layout.tsx](src/app/%5Blocale%5D/layout.tsx).
7. **Pitch texture** — applied as a background layer in [src/app/globals.css](src/app/globals.css) for `.gradient-hero`.

---

## Verification

After assets are generated and wired:
- `npm run build` — no broken image references
- Chrome DevTools → Application → Manifest — icons array populated, no missing icon warnings
- Lighthouse PWA audit — installable check should pass
- Check favicon appears in browser tab
- Check OG image renders correctly via [opengraph.xyz](https://www.opengraph.xyz) or similar
