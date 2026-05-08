# Airbotix Design System

> **Bright but smart.** A K-12 AI coding & robotics brand that feels welcoming like a great school and sharp like a great product.

---

## Overview

Airbotix talks to four audiences at once: **kids** (8–17, who see the visuals first), **parents** (who pay), **teachers** (who recommend), and **investors** (who scrutinise). The design language has to make all four feel something different but compatible:

- Kids → "this feels like fun, I want to try it"
- Parents → "this brand looks like it cares, and like it's run by competent people"
- Teachers → "this is professional and curriculum-credible"
- Investors → "this is a serious product, not a hobby project"

The core move: **saturated, joyful color** carries the warmth, while **disciplined typography and layout** carry the credibility. Personality comes through small, deliberate touches (sticker-style badges, hand-drawn squiggle underlines, soft blob shapes in section backgrounds), never through cartoonish illustrations.

**Reference brands to feel:** Brilliant.org · Khan Academy · Duolingo · Tinkercad · Outschool. Bright, rounded, confident — never childish.

**Reference brands to NOT feel like:** AI-infrastructure brands (MiniMax, OpenAI), generic SaaS dashboards, traditional ed-tech (textbook publishers).

**Key Characteristics:**
- **Soft warm canvas** (`#FFFEF7`, not pure white) — the page itself feels like good paper, not a screen
- **5-color saturated palette** with broad usage — colors appear in section backgrounds, stat tiles, callouts, decorative blobs (not just program cards)
- **Plus Jakarta Sans** for everything from 96px hero displays to 12px micro labels — geometric but rounded, much friendlier than DM Sans
- **Caveat** (handwritten) for selective accent moments — squiggle annotations, hand-drawn arrows, "fun" callouts (max 1–2 per page)
- **Generous radius scale** — 24px standard cards, 40px hero/program cards, full pill on buttons
- **Generous spacing** — 120–160px section rhythm, 40px card padding, more breathing room than tech-brand norms
- **Brand-tinted shadows** — pink card carries pink glow, mint card carries mint glow; gives depth and color vibrance
- **Sticker badges** — small rotated pills with hard shadows that look like real stickers
- **Soft blob shapes** behind hero sections in pale brand color — gives organic depth

---

## Colors

### Brand Palette (5 saturated, joyful colors)

The brand uses **five** colors instead of four. The fifth (Mint) gives more variety for section backgrounds, stat tiles, and decorative moments without overloading a single hue.

| Token | Hex | Personality | Primary use |
|---|---|---|---|
| **Brand Coral** (`{colors.brand-coral}`) | `#FF7A66` | Warm, energetic, signature | AI Coding · main CTA accent · "NEW" badges |
| **Brand Bubblegum** (`{colors.brand-bubblegum}`) | `#FF6BA9` | Playful, joyful, kid-positive | Hackathons · achievement · celebration |
| **Brand Sunshine** (`{colors.brand-sunshine}`) | `#FFD43B` | Bright, optimistic | Robotics · creative-build · highlight moments |
| **Brand Sky** (`{colors.brand-sky}`) | `#5DAEFF` | Trustworthy, calm | Schools / curriculum · parent-facing surfaces |
| **Brand Mint** (`{colors.brand-mint}`) | `#3DD9A9` | Fresh, growing, positive | Progress · success · new-cohort moments |

**Why these instead of the previous palette:**
- Plum was too "tech enterprise"; **Bubblegum pink** reads as joyful and kid-positive
- Sunshine is more saturated (`#FFD43B` vs `#FFC93D`) — feels brighter on screen
- Coral is slightly warmer (`#FF7A66` vs `#FF6B5B`) — feels less corporate
- Mint is new — opens up "growth/positive/fresh" moments

### Brand Gradient Pairs (for hero cards & promo strips)

| Token | Gradient |
|---|---|
| `{grad.coral}` | `linear-gradient(135deg, #FF9A80 0%, #FF5B7E 100%)` |
| `{grad.bubblegum}` | `linear-gradient(135deg, #FF8FBE 0%, #FF4F8F 100%)` |
| `{grad.sunshine}` | `linear-gradient(135deg, #FFE26B 0%, #FFB638 100%)` |
| `{grad.sky}` | `linear-gradient(135deg, #7FC2FF 0%, #3D8FFF 100%)` |
| `{grad.mint}` | `linear-gradient(135deg, #6BE7BF 0%, #1FC692 100%)` |

### Surface

- **Canvas Warm** (`{colors.canvas}` = `#FFFEF7`) — primary page background. **Not pure white**; the warm tint (~3% off white) makes the brand feel more human and less screen-like. Critical to the K-12 feel.
- **Canvas Pure** (`{colors.canvas-pure}` = `#FFFFFF`) — for cards, modals, anywhere true white reads better.
- **Surface** (`{colors.surface}` = `#FFF8EE`) — soft cream wash for alternating sections.
- **Surface Soft** (`{colors.surface-soft}` = `#FFF1DE`) — slightly stronger cream wash.
- **Hairline** (`{colors.hairline}` = `#EFE8DA`) — warm-toned border (matches the canvas warmth).

### Color Wash Sections (NEW)

Pale-tint section backgrounds — gives each section a personality without screaming. ~7% saturation:

- **Coral wash** (`{wash.coral}` = `#FFEFE9`)
- **Bubblegum wash** (`{wash.bubblegum}` = `#FFEAF3`)
- **Sunshine wash** (`{wash.sunshine}` = `#FFF7D6`)
- **Sky wash** (`{wash.sky}` = `#E8F2FF`)
- **Mint wash** (`{wash.mint}` = `#DCF6EC`)

Use these as section backgrounds (e.g., "Where We Are Today" on coral wash, "Programs" on sky wash). Adjacent sections rotate washes so the page feels alive without any single color dominating.

### Text

- **Ink** (`{colors.ink}` = `#1F1B2D`) — primary headings & body. Slightly warmer than pure black; reads softer.
- **Ink Soft** (`{colors.ink-soft}` = `#3D3851`) — body & long-form prose.
- **Slate** (`{colors.slate}` = `#6B6478`) — secondary, captions.
- **Steel** (`{colors.steel}` = `#9C95AB`) — tertiary, metadata.
- **Stone** (`{colors.stone}` = `#C7C0D5`) — muted, dividers between subtle text.
- **On-Dark** (`{colors.on-dark}` = `#FFFEF7`) — text on vibrant cards & ink surfaces (warm white, not pure).
- **On-Sunshine** (`{colors.on-sunshine}` = `#1F1B2D`) — sunshine yellow needs ink for contrast.

---

## Typography

### Font Family

**Plus Jakarta Sans** (primary, weights 400/500/600/700/800).
Loaded from Google Fonts. Fallbacks: `Inter, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif`.

**Caveat** (accent, weight 600/700) — used **sparingly** for hand-drawn moments. Squiggle annotations, "actually 100+!" callouts, fun decorations. Maximum 1–2 instances per surface.

**Why Plus Jakarta over DM Sans:**
Plus Jakarta has rounder counters, more humanist character, slightly larger x-height. Reads warmer at every size. DM Sans was right for an AI-infrastructure brand; Plus Jakarta is right for a K-12 brand.

### Hierarchy

| Token | Size | Weight | Line height | Letter spacing | Use |
|---|---|---|---|---|---|
| `{type.hero-display}` | **96px** | 700 | 1.05 | -0.025em | Homepage hero · pitch deck cover |
| `{type.display-lg}` | **72px** | 700 | 1.05 | -0.020em | Section heroes |
| `{type.heading-lg}` | **52px** | 700 | 1.10 | -0.015em | Major page headlines |
| `{type.heading-md}` | **40px** | 600 | 1.15 | -0.010em | Subsection headers |
| `{type.heading-sm}` | **28px** | 600 | 1.25 | -0.005em | Card titles |
| `{type.card-title}` | **22px** | 600 | 1.30 | 0 | Feature card titles |
| `{type.lead}` | **20px** | 500 | 1.55 | 0 | Lead paragraphs · subtitle |
| `{type.body}` | **17px** | 400 | 1.65 | 0 | Primary body |
| `{type.body-medium}` | **17px** | 500 | 1.65 | 0 | Body emphasis |
| `{type.body-sm}` | **15px** | 400 | 1.55 | 0 | Secondary body, table cells |
| `{type.caption}` | **13px** | 500 | 1.55 | 0 | Captions, metadata |
| `{type.eyebrow}` | **13px** | 700 | 1.40 | 0.10em | UPPERCASE eyebrow labels |
| `{type.button}` | **15px** | 600 | 1.40 | 0 | Pill button labels |

**Caveat (accent only):**

| Token | Size | Weight | Use |
|---|---|---|---|
| `{type.handwritten}` | **24px** | 600 | Squiggle annotations, "look here!" callouts |
| `{type.handwritten-lg}` | **40px** | 700 | Hero accent words (e.g., "with AI" written by hand) |

### Principles

- **Bigger everywhere.** Hero 96px (was 64–72px); body 17px (was 16px); card titles 22px (was 20px). The whole system steps up by 1–2 sizes — feels more confident and easier to read for a wide audience.
- **Looser letter-spacing on display.** -0.025em / -0.02em (was -1.5px / -2px). Tight tracking reads cold; slightly looser reads warmer.
- **Generous body line-height.** 1.65 for body (was 1.55). More air between lines = feels welcoming.
- **Weight discipline.** 400 (body), 500 (medium), 600 (heading), 700 (display), 800 (rare emphasis only).
- **Caveat is a guest, not a host.** Use it for personality moments — never for body text or large blocks.

---

## Layout

### Spacing

**Bigger than tech-brand defaults** — generous spacing reads as confidence and care.

- **Base unit**: 4px.
- **Tokens**: `xxs`(4) `xs`(8) `sm`(12) `md`(16) `lg`(24) `xl`(32) `xxl`(40) `xxxl`(56) `section-sm`(80) `section`(120) `section-lg`(160) `hero`(200).
- **Section rhythm**: marketing pages separate at **120–160px** vertical (was 80–96px). Hero gets **200px** below.
- **Card padding**: standard cards **40px** (was 32px); hero / program cards **48px**; promo strips **80px**.

### Grid & Container

- Marketing max-width: **1240px** (slightly tighter than 1280 — keeps feel intimate, less corporate).
- Side gutters: **32px** desktop, **24px** mobile.
- Program-card row: 4 cols on desktop, 2 cols on tablet, horizontal scroll on mobile.
- Stat-tile row: 3 cols on desktop, 1 col stacked mobile.

### Asymmetric & Off-grid Touches

Avoid pure left-aligned grid every section. Mix in:
- **Off-center hero** with sticker badge poking out top-right of a card
- **Tilted polaroid** photo (-2° to +3° rotation)
- **Sticker callouts** floating outside card edges (with rotation)
- **Wave dividers** between alternate-color sections (SVG)

These keep the page feeling alive instead of "Tailwind template".

---

## Elevation & Depth

### Brand-tinted Shadow System (NEW)

Cards carry shadows tinted by their own brand color — gives the page color vibrance even in shadow areas.

| Card | Shadow |
|---|---|
| Coral card | `0 16px 40px -8px rgba(255, 122, 102, 0.40)` |
| Bubblegum card | `0 16px 40px -8px rgba(255, 107, 169, 0.40)` |
| Sunshine card | `0 16px 40px -8px rgba(255, 212, 59, 0.45)` |
| Sky card | `0 16px 40px -8px rgba(93, 174, 255, 0.40)` |
| Mint card | `0 16px 40px -8px rgba(61, 217, 169, 0.40)` |
| White card on warm canvas | `0 8px 24px -6px rgba(31, 27, 45, 0.10)` |
| Sticker (hard offset) | `4px 4px 0 0 rgba(31, 27, 45, 0.95)` |

The "sticker hard shadow" is a deliberate flat 4px offset (no blur) — gives badges a real-sticker feel.

### Soft Blob Backgrounds

Pale-color organic blob shapes behind hero or feature sections, opacity ~0.5, very large (400–600px). Feels like a friendly background, not a tech grid. Implemented as SVG.

---

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 6px | Code chips, micro |
| `{rounded.sm}` | 10px | Compact controls |
| `{rounded.md}` | 14px | Inputs, secondary surfaces |
| `{rounded.lg}` | 20px | Recommendation tiles |
| `{rounded.xl}` | **24px** | **Standard content cards** (was 16px) |
| `{rounded.xxl}` | 32px | Larger feature panels |
| `{rounded.xxxl}` | **40px** | **Vibrant program cards / hero promo cards** (was 32px) |
| `{rounded.full}` | 9999px | Buttons, badges, pill tabs, sticker labels |

The new 24/40 contrast (vs old 16/32) gives the system more roundness everywhere — reads friendlier and more K-12.

---

## Components

### Buttons (pill, three tiers)

**`button-primary`** — Coral pill (NEW: was ink-black). The signature CTA changes from monochrome ink to brand-coral. Reads more inviting on a K-12 surface.
- Background `{colors.brand-coral}`, text `{colors.on-dark}`, type `{type.button}`, padding `14px 28px`, height 48px, rounded `{rounded.full}`.
- Pressed state: `#FF5C46` (deeper coral).

**`button-secondary`** — Outline pill in ink.
- Background transparent, text `{colors.ink}`, border `2px solid {colors.ink}`, padding `12px 28px`, height 48px, rounded `{rounded.full}`.

**`button-on-color`** — Warm-white pill on a vibrant card background.
- Background `{colors.canvas}` (the warm white), text `{colors.ink}`, padding `14px 28px`, rounded `{rounded.full}`.

### Sticker Badge (NEW signature component)

**`sticker`** — Small pill with rotation and hard shadow, used for callouts ("NEW", "ENROLLING", "AGES 8-13").
- Background = brand color (one of 5), text `{colors.ink}` (or on-dark for darker grounds), padding `6px 14px`, rounded `{rounded.full}`, font `{type.eyebrow}`.
- Transform `rotate(-3deg)` (or `rotate(2deg)` for variety).
- Box-shadow `4px 4px 0 0 rgba(31, 27, 45, 0.95)` — flat hard offset, no blur.
- Used to label cards, mark "popular" programs, add personality.

### Eyebrow Labels

Small UPPERCASE labels above headlines. **Now use brand color, not just ink.** Each section's eyebrow uses the section's identity color to add color rhythm to the page.

```
[CORAL] OUR PROGRAMS    →  in coral
[SKY] WHERE WE ARE      →  in sky
[BUBBLEGUM] STUDENT LIFE →  in bubblegum
```

### Hand-drawn Squiggle Underline (NEW)

Below specific hero words, draw a wavy line in brand color using inline SVG. Adds personality to ONE word per hero.

```
Teach kids to code with AI
                 ~~~~~~  ← squiggle underline in coral
```

Usage rule: max 1 squiggle per page. Always under a single keyword, not a phrase.

### Vibrant Program Cards

**`program-card-coral / bubblegum / sunshine / sky / mint`** — Each card has its program color identity.
- Background = brand gradient (matching color), text = on-dark (or ink for sunshine), rounded `{rounded.xxxl}` (40px), padding `{spacing.xxxl}` (56px), brand-tinted shadow.
- Title in `{type.heading-md}` (40px). Tagline in `{type.body}` at 90% opacity.
- Optional `sticker` top-right corner — slightly rotated, "NEW" or "ENROLLING".
- Optional decorative blob inside the card (large, 70% opacity, positioned bottom-right).

### Stat Tile (refreshed)

**`stat-tile`** — Big number tile.
- Background `{colors.canvas-pure}` OR a `{wash}` color, rounded `{rounded.xxl}` (32px), padding `48px 32px`, brand-tinted shadow (matching the number's color).
- Number in `{type.display-lg}` (72px) **weight 800** (extra bold for impact), color = brand color.
- Label in `{type.eyebrow}` UPPERCASE, color `{colors.slate}`.
- Optional small sticker overlay top-right.

### White Content Card

**`card-base`** — Standard 24px card.
- Background `{colors.canvas-pure}`, rounded `{rounded.xl}` (24px), padding `{spacing.xl}–{spacing.xxl}`, white-card shadow.

### Promo Card (vibrant CTA strip)

**`promo-card`** — Large hero CTA at section level.
- Background = brand gradient, rounded `{rounded.xxxl}` (40px), padding `{spacing.section-sm}` (80px) horizontally and vertically generous.
- Title in `{type.display-lg}`. Embedded `button-on-color`.
- Decorative soft blob in background, sticker badge floating outside top-right corner.

### Wave Section Divider (NEW)

SVG wave shape (~40px tall) between sections of different background colors. Adds organic transition instead of hard color edges. Use sparingly — every 2–3 section transitions, not all of them.

---

## Imagery

- **Real student photos.** Bright, candid, joy-on-face shots of kids in workshop. Never posed stock photography. Never dark studio portraits.
- **Polaroid frame treatment.** Wrap photos in a white frame with rounded corners, slight rotation (-2 to +3°), brand-tinted shadow.
- **Sticker overlay on photos.** Small brand-color sticker can sit at corner of a photo ("AGES 11-13" or "PILOT 2026").
- **Blob masking.** Hero photos can be masked into a soft-blob shape (irregular round) instead of rectangle.

---

## Personality Elements

A short list — these are the brand's "human touch" devices. Use **one or two per page**, never more.

1. **Sticker badge** (rotated pill with hard shadow) — see component spec.
2. **Squiggle underline** (SVG wavy line under keyword) — coral or current-section color.
3. **Soft blob shapes** (large pale-color organic SVG) — sit behind hero / feature sections, low opacity.
4. **Hand-drawn arrow** (Caveat or SVG) — between cards or pointing to a stat.
5. **Tilted polaroid photo** (-2 to +3° rotation, white frame, brand shadow).
6. **Big circular brand stamp** — large brand-color disc anchoring a section corner.

Hard rule: **Never more than 2 of these on the same screen.** Otherwise it crosses into cartoon territory.

---

## Do's and Don'ts

### Do
- Use **Plus Jakarta Sans** as the only typeface for system content; **Caveat** for at-most-2 accent moments per page.
- Use **section color washes** to alternate vibe — adjacent sections should rotate (e.g., coral wash → sky wash → cream → mint wash).
- Ship **brand-tinted shadows** on vibrant cards — matching color glow.
- Apply **`{rounded.xl}` (24px)** everywhere by default; **`{rounded.xxxl}` (40px)** for vibrant program/promo cards.
- Use **sticker badges** with rotation for delight moments — "NEW", "POPULAR", "AGES 8-13".
- Use the **5-color palette broadly** — section backgrounds, stat tiles, callouts, eyebrows. Color is the warmth.
- Pair **bigger type** with **bigger spacing** — both step up together.

### Don't
- **Don't pure-white the canvas.** Use warm canvas `#FFFEF7`. Pure white reads cold and tech.
- **Don't go cartoon.** No emoji headers, no clip-art mascots, no Comic Sans, no rainbow gradients on text.
- **Don't tighten letter-spacing past -0.025em.** Tight tracking reads editorial, not K-12.
- **Don't put more than 2 personality elements on one screen.** Stickers + squiggle is fine; stickers + squiggle + blob + polaroid + handwritten arrow is chaos.
- **Don't use Caveat for body text or anything readable.** It's a flavor; never a meal.
- **Don't lose the brand-color relationship.** Coral = AI Coding, Sunshine = Robotics, Bubblegum = Hackathons, Sky = Schools, Mint = Progress/Success. Don't reassign casually.
- **Don't shadow flat-on-warm-canvas cards heavily** — small 8px shadow is enough; warm canvas absorbs more.

---

## Voice & Tone

- **Address the reader directly** — "you" not "users".
- **Short sentences.** Especially on hero. K-12 audiences scan first.
- **Use "kids" not "students" on parent-facing surfaces.** "Students" for school-facing.
- **No buzzword stack.** No "transformative AI literacy paradigm". Say "kids learn to code with AI."
- **One sentence per hero.** If it can be cut, cut it.
- **Be confident, not boastful.** "An early-stage pilot, focused on doing it right" beats "leading AI education innovator".

---

## Responsive

| Name | Width | Key changes |
|---|---|---|
| Mobile small | < 480 | Single column, hero 56px, programs horizontal-scroll, stickers shrink |
| Mobile large | 480–767 | 2-up program tiles |
| Tablet | 768–1023 | 2-col program matrix, 2-col stat tiles |
| Desktop | 1024–1239 | Full 4-col program matrix |
| Wide | ≥ 1240 | Full layout with max-width 1240 |

### Hero scaling
- 96px → 72px at <1024 → 56px at <768 → 44px at <480.

### Touch targets
- Pill buttons: 48px desktop → bump to 52px mobile.
- Inputs: 48px both.
- Sticker tap area: 32px min.

---

## Iteration Guide

1. Reference tokens directly (`{colors.brand-coral}`, `{rounded.xxxl}`, `{type.hero-display}`) — never paraphrase.
2. Default font is Plus Jakarta Sans 400/500/600/700; Caveat for max-2 accent moments per page.
3. Default body 17px / 1.65; default heading hierarchy goes hero-display (96) → display-lg (72) → heading-lg (52) → heading-md (40) → heading-sm (28) → card-title (22).
4. Default radius 24px content cards / 40px vibrant cards / full pill buttons.
5. Sections should alternate **canvas → wash → canvas → wash** to keep page lively.
6. Every page should have **at least 1 vibrant moment** (program card, promo strip, color-washed section).
7. Every page should have **at most 2 personality elements** (sticker, squiggle, blob, polaroid, arrow).
8. Brand colors are **assigned to programs**, not free choices. Coral = AI Coding · Sunshine = Robotics · Bubblegum = Hackathons · Sky = Schools · Mint = Progress.

---

## Known Gaps

- Dark mode tokens not yet defined.
- Animation timings to add: 200ms ease-out for state transitions; 400ms for sticker hover-jiggle (subtle rotation reverse); 6s gentle blob drift on hero.
- Iconography to select — recommend **Phosphor** or **Lucide** at consistent stroke 1.5px, paired with selective brand-color icon backgrounds.
- Photography style guide — establish lighting (bright, naturalistic), framing (medium-close on student work, never wide stock-photo classroom), color grading (warm, slightly desaturated).
