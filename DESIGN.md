# Design System

This document specifies the visual rules and component patterns for the Ahmet Karaca Portfolio project. It follows the Google Stitch DESIGN.md specification to provide a portable, agent-readable design system.

## Overview
A modern, comprehensive portfolio site for an architecture and software engineering student. The design emphasizes clarity, technical precision (architectural feel), and a smooth user experience across both light and dark modes.

## Colors

### Palette
- **Primary:** `#197fe6` (A vibrant blue used for actions and highlights)
- **Primary Hover:** `#156cbd`
- **Primary Dark:** `#156cb8`

### Semantic Tokens
- **Background:**
  - `light`: `#f6f7f8`
  - `dark`: `#111921`
- **Surface:**
  - `light`: `#ffffff` (Mainly for cards and modals in light mode)
  - `dark`: `#1a2632` (Surface for components in dark mode)
- **Neutral Scale:**
  - `neutral-800`: `#151e29`
  - `neutral-700`: `#1e2b3b`
  - `neutral-600`: `#334155`
  - `neutral-400`: `#94a3b8`
  - `neutral-200`: `#e2e8f0`
- **Status:**
  - `success`: `bg-green-100 text-green-800`
  - `warning`: `bg-yellow-100 text-yellow-800`
  - `error`: `bg-red-100 text-red-800`
  - `info`: `bg-blue-100 text-blue-800`

## Typography

### Font Families
- **Display:** `Inter, sans-serif` (Primary UI and headings)
- **Serif:** `Playfair Display, serif` (Elegant headings/quotes)
- **Mono:** `Space Grotesk, monospace` (Technical/code data)
- **Technical:** `Lexend, sans-serif`
- **Alternative Serif:** `Noto Serif, serif`

### Type Scale
- **h1:** 32px / 700 weight / 1.2 line-height (Inter)
- **h2:** 24px / 600 weight / 1.2 line-height (Inter)
- **h3:** 20px / 600 weight / 1.2 line-height (Inter)
- **body:** 16px / 400 weight / 1.6 line-height (Inter)
- **caption:** 14px / 500 weight (Inter)
- **code/data:** 12px / 400 weight (Space Grotesk)

## Spacing & Layout

### Base Units
- **Base Grid:** 4px (1rem = 16px)
- **Container Padding:** `p-4` (Mobile), `p-6` (Desktop)
- **Section Gap:** `space-y-8`, `gap-8`

### Visual Rules
- **Border Radius:**
  - `default`: `4px` (0.25rem)
  - `rounded-xl`: `12px` (0.75rem) - Used for inputs and small components
  - `rounded-2xl`: `16px` (1rem) - Used for cards and sections
- **Shadows:**
  - `card`: `shadow-md`
  - `modal`: `shadow-2xl`
- **Transitions:** `duration-200`, `duration-300`, `ease-out`

## Component Patterns

### Buttons
- **Primary:**
  - `style`: `rounded-xl bg-primary px-5 py-2 text-white font-medium`
  - `hover`: `bg-primary-hover`
- **Secondary/Outline:**
  - `style`: `rounded-xl border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800`

### Cards (e.g., ProjectCard)
- **Container:** `rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 overflow-hidden`
- **Interaction:** `whileHover={{ y: -5 }}` (framer-motion)
- **Image:** `w-full h-48 object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-105`

### Inputs & Forms
- **Field:** `w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40`
- **Section Box:** `rounded-2xl border border-slate-800 bg-slate-950/60 p-5`

### Navigation (Navbar)
- **Style:** Sticky top, `backdrop-blur`, border-bottom
- **Height:** 72px (approx)
- **Links:** `text-sm font-medium transition-colors hover:text-primary`

## Animations
- **Fade In Up:** `fadeInUp 0.6s ease-out forwards`
- **Fade Up:** `fadeUp 0.6s ease-out forwards`
- **Smooth Scroll:** `scroll-behavior: smooth`
