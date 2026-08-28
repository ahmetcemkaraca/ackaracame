# Design System — Meridian v3

This document specifies the visual rules and component patterns for the ACKaraca portfolio. It follows the Google Stitch DESIGN.md specification to provide a portable, agent-readable design system. It reflects the implemented tokens in `src/styles/global.css`.

## Overview
A bilingual portfolio for an architecture student and product developer. "Meridian v3" pairs porcelain (light) and graphite (dark) surfaces with an ultramarine signal accent, hairline blueprint textures, editorial serif italics, and fluid spring motion. Accessibility (focus rings, reduced motion, keyboard support) is a design input, not an afterthought.

## Colors

### Palette
- **Accent:** `#2b3fee` light / `#5c74ff` dark (primary actions, active states)
- **Accent Strong:** `#1d2cc4` light / `#93a7ff` dark
- **Signal:** `#0c8a6d` light / `#45d0bf` dark (availability, success)
- **Amber:** `#c97a15` light / `#e8a33d` dark (constraints, warnings)
- **Danger:** `#b3402a` light / form errors

### Semantic Tokens
- **Background:**
  - `light`: `#f7f6f2` (porcelain)
  - `dark`: `#0a0c11` (deep graphite)
- **Raised Surface:** `#fffefb` light / `#12151d` dark (cards, panels)
- **Deep Surface:** `#edeae1` light / `#191d28` dark (wells, segmented controls)
- **Inverse Footer:** footer always inverts (`--inverse-bg` = ink of current theme)
- **Lines:** hairline `rgba(ink, 0.12–0.13)`; strong `rgba(ink, 0.26–0.28)`
- **Text:** `--ink` `#0e1119`/`#edeff5`, soft and faint tiers at reduced contrast
- **Texture:** fixed film-grain SVG noise overlay at 4–7% opacity; center hairline on body

## Typography

### Font Families
- **Sans/Display:** `'Manrope Variable'` (UI, headings; weights 500–830, tight tracking −0.02em to −0.042em)
- **Serif Accent:** `'Newsreader Variable'` italic (editorial emphasis inside headlines, deks, quotes)
- **Mono:** `ui-monospace, 'SF Mono', 'Cascadia Code', Menlo` (kickers, meta rows, kbd, code)

### Type Scale (fluid via clamp)
- **Hero h1:** `clamp(2.7rem, 6.6vw, 5.6rem)` / 780 / line-height 1.0
- **Page h1:** `clamp(2.4rem, 5.4vw, 4.4rem)` / 760
- **Section h2:** `clamp(1.9rem, 3.6vw, 3.1rem)` / 750
- **Card h3:** `clamp(1.35rem, 2.2vw, 1.7rem)` / 740
- **Body:** 1.05–1.12rem / 400–450 / line-height 1.65–1.78
- **Eyebrow/Meta:** 0.72rem / 700 / letter-spacing 0.22em uppercase

## Spacing & Layout

### Base Units
- **Shell width:** `min(86rem, 100vw − clamp(2rem, 6vw, 5rem))`
- **Header height:** `4.75rem` desktop / `4.25rem` mobile
- **Section padding:** `clamp(4.5rem, 10vw, 8.5rem)` block

### Visual Rules
- **Radii:** cards `1.25rem`, panels/case media `1.75rem`, pills/buttons `999px`
- **Shadows:** three tiers (`sm/md/lg`) + ultramarine glow `--glow` for primary actions
- **Motion curves:** `--ease-out cubic-bezier(.22,1,.36,1)`, springy `--ease-spring cubic-bezier(.34,1.56,.64,1)`
- **Breakpoints:** 1080px (nav collapses), 900px (grids stack), 640px (single column forms/stats)

## Component Patterns

### Buttons
- **Primary:** pill, `linear-gradient(135deg, accent, accent-strong)`, white text, glow shadow; hover lifts −2px and nudges arrow icon
- **Ghost:** pill, hairline border; hover tints border/background with accent

### Header (SiteHeader)
- Fixed, transparent → glass (`backdrop-blur`, hairline bottom) after 16px scroll
- Scroll progress bar: 2px accent→signal gradient scaled by `--scroll-progress`
- Nav links animate a scaleX underline from the left; active state persists
- Brand mark: two-letter tile (ink + accent gradient), rotates −6° on hover
- ≤1080px: hamburger opens a full-screen opaque overlay menu with staggered numbered links, focus trap, Escape restore

### Cards (ProjectCard)
- Raised surface, hairline border, generative artwork header (16:9)
- Pointer-driven 3D tilt (max ~5°, `--tilt-x/--tilt-y`) + radial spotlight (`--spot-x/--spot-y`)
- Hover: lift −6px, glow shadow, title→accent, arrow slides into accent circle
- Meta row in mono caps; tech chips as bordered pills; verified metric in signal green

### Home Hero
- Layered background: pointer-tracked aura gradients (`--mx/--my`) + constellation canvas
- Kinetic headline: per-line clip reveal (`line-rise`), middle line Newsreader italic in accent
- Utility column: ⌘K search card + hire/explore lens segmented control
- Below: marquee strip (32s loop, edge mask, pause on hover), animated stat counters

### Forms (ContactPage)
- Inputs: 0.8rem radius, hairline border, accent focus ring/glow; error state uses danger token
- Custom checkbox for consent; visually hidden honeypot; live character counter

### Footer
- Inverse panel with rounded top corners; CTA lead, link columns
- Giant outlined wordmark ("ACKARACA") fills on hover; motion preference toggle persists

## Animations
- Scroll reveals: `whileInView` fade+26px rise, once, `Reveal` helper (respects MotionConfig reduced-motion)
- Keyframes: `line-rise` (headline), `marquee-slide`, `availability-pulse`, `radar-pulse/spin` (Lab), `scroll-nudge`
- `prefers-reduced-motion`: animations collapse to 0.01ms, marquee stops, transforms neutralized
