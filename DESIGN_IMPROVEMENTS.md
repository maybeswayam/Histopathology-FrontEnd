# HistoAI — Comprehensive Design Improvements Spec

**Document type:** Product design / UX / visual identity gap analysis + actionable redesign plan  
**Audience:** Design, product, frontend engineering  
**Scope:** All user-facing surfaces in `frontend/` (marketing, auth, analyze, dashboard, system tokens)  
**Companion doc:** `IMPROVEMENTS.md` (engineering / production / ML). This file is **design-only**.  
**Status of design today:** **Accepted by product owner (2026-07-29)** — no further design redesign planned unless explicitly requested  
**Last reviewed against codebase:** 2026-07-29  
**Active backlog:** None for design. Engineering gaps live in `IMPROVEMENTS.md` only.

Status legend: **DONE** · **PARTIAL** · **OPEN**

---

## Table of contents

0. [Remaining backlog (re-audit)](#0-remaining-backlog-re-audit)
1. [Executive verdict](#1-executive-verdict)
2. [How to use this document](#2-how-to-use-this-document)
3. [Design principles (north star)](#3-design-principles-north-star)
4. [Current design baseline](#4-current-design-baseline)
5. [Brand system gaps](#5-brand-system-gaps)
6. [P0 — Identity & clinical core](#6-p0--identity--clinical-core)
7. [P1 — System, consistency & landing craft](#7-p1--system-consistency--landing-craft)
8. [P2 — Credibility, motion, a11y & polish](#8-p2--credibility-motion-a11y--polish)
9. [P3 — Nice-to-haves](#9-p3--nice-to-haves)
10. [Per-surface redesign briefs](#10-per-surface-redesign-briefs)
11. [Information architecture](#11-information-architecture)
12. [Content & voice](#12-content--voice)
13. [Design tokens & component rules](#13-design-tokens--component-rules)
14. [Anti-patterns to ban](#14-anti-patterns-to-ban)
15. [Phased delivery plan](#15-phased-delivery-plan)
16. [Success metrics & critique checklist](#16-success-metrics--critique-checklist)
17. [File inventory (what to touch / delete)](#17-file-inventory-what-to-touch--delete)
18. [Appendix A — Proposed brand kit](#18-appendix-a--proposed-brand-kit)
19. [Appendix B — Wireframe priorities (text)](#19-appendix-b--wireframe-priorities-text)
20. [Appendix C — Relationship to engineering IMPROVEMENTS.md](#20-appendix-c--relationship-to-engineering-improvementsmd)

---

## 0. Remaining backlog (re-audit)

### Status: CLOSED — design accepted

Product owner accepted the current UI/UX (2026-07-29). **Do not treat home hero, gradient-clip, DarkVeil, OG images, or other design polish as open work** unless a new design request is made.

Historical scorecard and item write-ups below are retained for reference only.

### Fix next (design)

**None.** Optional P3 (OG/PDF/samples) only if explicitly requested later.

### Already shipped (reference)

- `/landing` → `/`  
- Canonical Logo + AppHeader solid New analysis  
- Analyze hero upload + CaseReview  
- Dashboard diet + pagination  
- Auth wash; ThemeProvider removed  
- Orphan landing templates deleted  
- Trust gate / disclaimers / DESIGN_SYSTEM.md  

---

## 1. Executive verdict

**Design track closed.** Current surfaces (home, auth, analyze, dashboard) are accepted as the product look. Remaining project work is engineering — see `IMPROVEMENTS.md` §0.

---

## 2. How to use this document

Each item follows:

- **Problem** — what users / reviewers feel today  
- **Impact** — trust, conversion, clinical clarity, brand  
- **Evidence** — files, copy, class patterns  
- **Improvement plan** — concrete redesign steps  
- **Target design** — what “done” looks like  
- **Acceptance criteria** — critique checklist  
- **Effort / dependency** — sizing + blockers  
- **Owner** — Design / Product / Eng  

Priority:

| Label | Meaning |
|-------|---------|
| **P0** | Must fix before claiming a coherent product brand |
| **P1** | Required for a credible marketing + app system |
| **P2** | Trust, motion, a11y, depth |
| **P3** | Delight and expansion |

---

## 3. Design principles (north star)

Commit to these as non-negotiable for HistoAI:

1. **One product, one language** — marketing and app share mark, type, color, radius, voice.  
2. **Brand first on marketing** — product name is hero-level; headlines support, never overpower.  
3. **One job per section** — especially dashboard: stop restating the same metrics.  
4. **Analyze is the product hero** — upload and case review get the highest craft budget.  
5. **Real visual anchor** — histopathology imagery (or honest Grad-CAM frames), not abstract orbs/SVG placeholders.  
6. **Cards only for interaction** — results, history items, chat, forms. Not for static notes.  
7. **Clinical calm over SaaS hype** — malignant results use weight and hierarchy, not candy red + glow kits.  
8. **Honest claims** — no “unprecedented accuracy” without proof UI; research/education framing visible.  
9. **Motion with purpose** — 2–3 intentional moments max per journey; no stacked shaders + pulse pills + parallax everywhere.  
10. **Tokens are law** — no one-off `green-600` / `emerald-*` / `gray-50` dialects without mapping to the system.

---

## 4. Current design baseline

*Updated 2026-07-29 — historical “three logos / broken CTAs” mostly resolved; remaining issues below.*

### 4.1 Tokens vs reality

**Defined & largely used** in `frontend/app/globals.css`:

- `--page-wash`, `--panel`, `--malignant*`, `--benign*`, `--radius-panel`, `--border-subtle`  
- DM Sans + Space Grotesk via `font-sans` / `font-display`  
- Dark theme tokens exist but unused  

**Still drifting:**

- Home gradient-clip uses raw `emerald-600` / `lime-600`  
- Orphan SaaS landing components still on disk (`hero-section`, `features-section` with purple, etc.)  
- `theme-provider.tsx` not mounted  
- `StatCard.tsx` unused but still contains glow/rainbow kit  

### 4.2 Logo system

**Canonical:** `components/brand/logo.tsx` (emerald tile + Microscope + wordmark) on marketing, auth, app shell.  
**Leftover risk:** old marks inside unused `components/landing/navigation.tsx`.

### 4.3 CTA map

| Control | Destination | Status |
|---------|-------------|--------|
| Marketing Get started | `/auth/sign-up` | Fixed |
| Marketing Sign in | `/auth/login` | Fixed |
| App “Analyze” ghost | `/analyze` | Exists |
| App solid “New analysis” | `/analyze` | **Missing** (`showPrimaryAction` unused) |
| Dead Watch Demo / Learn More | — | Still in orphan landing files |

### 4.4 Type reality

- Display face on home H1 / brand — good  
- Dashboard still uses many uppercase micro-labels — diet further with D0-04  

---

## 5. Brand system gaps

### B-01. No single brand system document or kit
**Status: OPEN** — encode live `globals.css` tokens into `docs/DESIGN_SYSTEM.md`.
**Problem:** Design decisions live as one-off Tailwind classes.  
**Plan:** Adopt Appendix A as the source of truth; encode in CSS variables + a short `docs/DESIGN_SYSTEM.md`.  
**Acceptance:** New UI PRs can be reviewed against the kit.

### B-02. Brand fails the first-viewport test
**Status: PARTIAL** — `<Logo size="hero" emphasize />` on `/`. Still missing edge-to-edge pathology/Grad-CAM visual; gradient-clip subtitle remains.
**Problem:** On `/`, “HistoAI” is small nav text; H1 owns the composition.  
**Plan:** Hero composition = brand wordmark (large) + one supporting headline + one sentence + one CTA + one dominant product visual.  
**Acceptance:** Remove nav in a critique screenshot — page is still unmistakably HistoAI.

### B-03. Package / metadata still say scaffold
**Status: DONE** — `generator: v0.app` removed; package `histoai-frontend`.
**Problem:** `generator: "v0.app"`; package historically named like a v0 project.  
**Plan:** Remove generator; set proper title/description/OG; rename package to `histoai-frontend`.  
**Acceptance:** View-source and npm name show HistoAI, not v0.

---

## 6. P0 — Identity & clinical core

---

### D0-01. Collapse to one marketing surface
**Status: DONE** — `app/landing/page.tsx` redirects to `/`. **Follow-up OPEN:** delete unused `components/landing/hero-section.tsx`, `features-section.tsx`, `cta-section.tsx`, `navigation.tsx` (and purple/pill templates) so they cannot be re-imported.

#### Problem
Two landings (`/` and `/landing`) with different craft, different CTAs, and different logo treatments. Contributors and users don’t know which is “real.”

#### Impact
Split brand, wasted maintenance, weaker conversion story.

#### Evidence
- Live: `frontend/app/page.tsx` (DarkVeil + thin sections)  
- Orphan: `frontend/app/landing/page.tsx` composing `hero-section`, `features-section`, `how-it-works`, `cta-section`, `navigation`

#### Improvement plan
1. Pick **one** home route: `/`.  
2. Redirect `/landing` → `/` (or delete route).  
3. Rebuild `/` using the best *ideas* from both (atmosphere + structure) while **stripping** template clichés (see anti-patterns).  
4. Stop importing unused landing components into a second parallel story.

#### Target design
Single narrative: Brand → promise → how it works → trust/limitations → CTA. No second marketing app.

#### Acceptance criteria
- [ ] Only one public marketing URL  
- [ ] `/landing` redirects or 404s  
- [ ] CTA map is identical in nav and hero  

#### Effort / dependency
**M.** Unblocks all other marketing work.

#### Owner
Design + Eng

---

### D0-02. One logo, one CTA map
**Status: PARTIAL** — Canonical `Logo` everywhere; marketing CTAs → `/auth/sign-up`. AppHeader still does not render a solid primary “New analysis” (`showPrimaryAction` unused).

#### Problem
Three marks and conflicting “Get Started” destinations destroy trust and funnel clarity.

#### Impact
Auth confusion; bounce; looks unfinished.

#### Evidence
See §4.2 and §4.3.

#### Improvement plan
1. **Canonical mark:** Emerald tile + microscope (dashboard treatment) OR a custom wordmark — pick one, SVG it, use everywhere.  
2. **CTA rules:**  
   - Primary (logged out): **Get started** → `/auth/sign-up`  
   - Secondary: **Sign in** → `/auth/login`  
   - Primary (logged in): **New analysis** → `/analyze`  
3. Never deep-link logged-out users to `/dashboard` or `/analyze` as the only CTA without auth context.  
4. Remove or wire dead buttons (“Watch Demo”, “Learn More”).

#### Target design
Same header mark on marketing, auth, analyze, dashboard. Predictable destinations.

#### Acceptance criteria
- [ ] Grep shows one logo component reused  
- [ ] All primary CTAs follow the map above  
- [ ] Zero dead hrefs on marketing  

#### Effort / dependency
**S–M.**

#### Owner
Design + Eng

---

### D0-03. Rebuild Analyze as the product hero
**Status: PARTIAL** — Matches dashboard wash; staged progress UI; `CaseReview` prediction-first. Still: upload not a true ~45vh hero stage; progress is client-timed; keep refining empty heatmap + error recovery.

#### Problem
Analyze is the core clinical moment and the **least designed** product surface. It looks like a gray utility page; upload isn’t heroic; results don’t prioritize the prediction; progress is a dimmed dropzone.

#### Impact
Users’ strongest memory of the product is weak. Dashboard feels “premium” while the actual tool feels “MVP.”

#### Evidence
- `app/analyze/page.tsx` — `bg-gray-50`, utilitarian header  
- `simple-image-upload.tsx` — `h-full` with no guaranteed min-height; short dashed strip risk  
- `modern-prediction-results.tsx` — equal layout weight with images; candy `text-red-500` / `text-green-500`  
- History detail modal on dashboard is a better case-review layout than live results  

#### Improvement plan
1. **Match dashboard visual language:** mint/emerald page wash, soft large panels, shared header mark.  
2. **Upload stage:** min-height ~42–50vh; clear drag affordance; file constraints; optional sample slide.  
3. **Progress stages (designed):**  
   - Idle → Uploading/reading → Running model → Rendering Grad-CAM → Complete  
   - Show stage label + calm progress (not only opacity).  
4. **Results layout (prediction-first):**  
   - Primary column: prediction band + confidence + probabilities + disclaimer  
   - Secondary: original | heatmap side-by-side (mirror `HistoryDetailModal`)  
5. **Heatmap empty state** if missing.  
6. Task-titled page: “Upload a slide” / “Case review” — not marketing slogan restatement.  
7. Soften malignant styling: deep rose/ink weight, not neon red.

#### Target design
Analyze feels like the same product family as dashboard, with higher focus and less chrome.

#### Acceptance criteria
- [ ] Side-by-side critique: analyze and dashboard share mark, radius, color wash  
- [ ] Upload stage occupies meaningful first viewport height  
- [ ] Prediction is visually dominant over images  
- [ ] Each analysis stage has distinct UI  
- [ ] Missing heatmap doesn’t leave a blank column  

#### Effort / dependency
**L.** Highest design ROI. Pair with engineering disclaimer work (`IMPROVEMENTS.md` P0-01).

#### Owner
Design (lead) + Eng

---

### D0-04. Diet the dashboard (one summary, one CTA)
**Status: PARTIAL** — StatCard strip + Gemini removed; empty hero CTA is good. **Still fix:** welcome / workspace / history panel still restate `analysesThisWeek` + counts; populated first viewport lacks one solid primary CTA (depends on D1-05).

#### Problem
Dashboard craft is strong but the first viewport repeats the same information 3–4 times and triples the primary CTA.

#### Impact
Looks busy with little content; new users with empty history see a metrics museum.

#### Evidence
`app/dashboard/page.tsx`:

- Welcome + “Next step” panel with Start analysis  
- Header “New Analysis”  
- Meta chips (Latest / Weekly / …)  
- Snapshot panel and/or StatCard row  
- Notes / quick summary restating totals  
- Empty state also CTAs to analyze  

`StatCard.tsx`: radial glows + multi-tone meters (SaaS kit smell).

#### Improvement plan
1. **Keep:** sticky header (mark + one primary CTA + logout), welcome line, history list, assistant.  
2. **Pick exactly one summary surface:** either a compact stats row **or** welcome meta chips — not both + Notes.  
3. **Empty state becomes the hero** when `history.length === 0`: large upload invitation, not empty stat zeros theater.  
4. Reduce uppercase eyebrow spam; one eyebrow per major section max.  
5. Soften or remove StatCard glows; use token chart colors sparingly.

#### Target design
```text
[ Header: Mark | New analysis | Logout ]
[ Welcome + one-line context + optional single summary strip ]
[ History (primary)     | Assistant (secondary) ]
```

#### Acceptance criteria
- [ ] Primary CTA appears once in the first viewport (header OK)  
- [ ] No metric is shown in more than one component  
- [ ] Empty history layout is intentionally designed (not zeroed gauges)  

#### Effort / dependency
**M.**

#### Owner
Design + Eng

---

### D0-05. Align auth to the product brand (minimum viable atmosphere)
**Status: DONE** — `bg-page-wash`, shared Logo, `rounded-panel`, success uses benign-muted (no blue box).

#### Problem
Auth is correct functionally but emotionally disconnected — pure white shadcn card with a third logo variant.

#### Impact
Funnel feels like a different app between marketing → signup → dashboard.

#### Evidence
`app/auth/login/page.tsx`, `sign-up/page.tsx` — centered card; `sign-up-success` uses `bg-blue-50` / `text-blue-600` (off-palette).

#### Improvement plan
1. Same logo component as app shell.  
2. Soft emerald wash or restrained DarkVeil/grain behind the card (subtle — clinical, not club lighting).  
3. Replace blue success callout with muted/primary token treatment.  
4. Keep form simple; don’t add social clutter unless real.

#### Acceptance criteria
- [ ] Auth screens pass “same family” critique next to dashboard  
- [ ] No blue exception boxes  
- [ ] Display font used for brand title only  

#### Effort / dependency
**S–M.**

#### Owner
Design + Eng

---

## 7. P1 — System, consistency & landing craft

---

### D1-01. Enforce design tokens; kill dialect drift
**Status: PARTIAL** — Product tokens live; `styles/globals.css` gone. Still: home gradient uses raw `emerald-600`/`lime-600`; orphan landing kit dialects; unused `StatCard` rainbow.

#### Problem
Tokens exist but pages invent local color/radius languages.

#### Impact
Impossible to maintain; brand dilutes with every PR.

#### Evidence
`app/globals.css` vs hardcoded utilities; orphan `styles/globals.css`; dashboard `emerald` vs analyze `gray-50` vs landing `green/lime/purple`.

#### Improvement plan
1. Extend CSS variables for: page wash, panel bg, panel radius (`--radius-panel`), eyebrow color, malignant/benign semantic.  
2. Replace hardcoded greens with `bg-primary`, `text-primary`, semantic tokens.  
3. Delete or stop shipping `styles/globals.css` if unused.  
4. Document “allowed Tailwind” patterns in `docs/DESIGN_SYSTEM.md`.  
5. Lint rule or PR checklist: no new `purple-*` / `indigo-*` on product surfaces.

#### Acceptance criteria
- [ ] Analyze, dashboard, auth share page-wash token  
- [ ] Orphan globals removed or clearly unused  
- [ ] One radius scale documented and followed  

#### Effort / dependency
**M.** Foundation for all visual PRs.

#### Owner
Eng + Design

---

### D1-02. Fix typography roles
**Status: PARTIAL** — `font-display` used on home/case titles; finish documenting roles in DESIGN_SYSTEM.md.

#### Problem
Space Grotesk is loaded but underused; labeled as serif incorrectly; hierarchy is mostly “bold DM Sans everywhere.”

#### Impact
Missed brand distinctiveness; weak display hierarchy.

#### Evidence
`layout.tsx` loads both fonts; `globals.css` maps Space Grotesk to `--font-serif`; usage sparse.

#### Improvement plan
1. Rename roles: `--font-display` (Space Grotesk) + `--font-sans` (DM Sans). Or replace Space Grotesk with a truer display choice if you want less “AI default” — but **commit** and use it.  
2. Rules:  
   - Display: brand wordmark, marketing H1, case prediction numeral  
   - Sans: UI, body, forms, tables  
3. Cap tracking on eyebrows; don’t use display for long paragraphs.

#### Acceptance criteria
- [ ] Marketing H1 and brand use display face  
- [ ] Body copy never uses display face  
- [ ] CSS variable names match actual font classification  

#### Effort / dependency
**S.**

#### Owner
Design + Eng

---

### D1-03. Rebuild the single landing without AI-SaaS clichés
**Status: OPEN** — Live `app/page.tsx` still uses gradient-clip H1 (`from-primary via-emerald-600 to-lime-600`) + DarkVeil without a real slide. Replace with brand + one headline + one CTA + edge-to-edge pathology/Grad-CAM frame. Delete dead landing components with purple/pill patterns.

#### Problem
`/landing` components are a catalog of generic AI landing patterns; live `/` is thin and claim-heavy without proof.

#### Impact
Looks like every other generated medtech landing; fails differentiation and trust.

#### Evidence
`hero-section.tsx`: pulse pill badge, gradient clip text, `rounded-full` CTAs, blur orbs, inset media card.  
`features-section.tsx`: 6 hover cards; icon gradients include `from-purple-500`, `from-indigo-500`.  
`page.tsx`: “Harness the power of artificial intelligence…”; college-origin section.

#### Improvement plan
1. **Hero budget only:** Brand (large) · one headline · one sentence · one CTA group · one dominant edge-to-edge pathology/Grad-CAM visual.  
2. **No** pulse pills, gradient text, floating badges, inset mock cards, rainbow feature grids.  
3. How-it-works: 3 steps max, typography-led, optional single supporting image — not icon-circle template.  
4. Replace college-friends story with **trust/limitations** (research use, model scope, what Grad-CAM is / isn’t).  
5. Optional single “method” section — one job, one headline.  
6. Motion: one entrance choreography OR keep veil; not both at full intensity.

#### Target design
Quietly confident clinical product page. Memorable for the **slide imagery + brand**, not for effects.

#### Acceptance criteria
- [ ] Brand test passes  
- [ ] Zero purple/indigo decorative accents  
- [ ] Full-bleed or edge-to-edge product visual in hero  
- [ ] No “unprecedented accuracy” without a sourced proof module  

#### Effort / dependency
**L.** After D0-01.

#### Owner
Design (lead) + Eng

---

### D1-04. Unify radius & control shapes
**Status: PARTIAL** — `--radius-panel` adopted on many surfaces; history badges still `rounded-full` (acceptable for chips — avoid on primary CTAs).

#### Problem
`--radius: 0.5rem`, dashboard `28px` panels, chat `36px`, landing `rounded-full` pills — three eras of UI.

#### Impact
Subconscious “different products” signal.

#### Improvement plan
1. Choose a **clinical soft** system:  
   - Controls: `rounded-md` / `rounded-lg`  
   - Panels: `--radius-panel: 1.25rem` (20px) or `1.5rem` (24px) — not 36px everywhere  
   - Avoid `rounded-full` for primary CTAs (pills read consumer-social, not clinical)  
2. Migrate dashboard/analyze/auth to the scale.  
3. Keep circular only for avatars/icon wells if needed.

#### Acceptance criteria
- [ ] Documented radius scale  
- [ ] Primary buttons not pill-shaped on product surfaces  
- [ ] Panels share one radius token  

#### Effort / dependency
**S–M.**

#### Owner
Design + Eng

---

### D1-05. Shared app shell (header)
**Status: PARTIAL** — `components/layout/app-header.tsx` shared. **Open:** wire `showPrimaryAction` to a solid `New analysis` button (Plus icon); keep Dashboard/Analyze as secondary nav.

#### Problem
Analyze and dashboard invent separate headers; marketing has a third.

#### Impact
Navigation learning cost; inconsistent logout/dashboard/analyze links.

#### Improvement plan
1. Build `AppHeader` used by `/analyze` and `/dashboard`.  
2. Slots: mark, section title, primary action, account/logout.  
3. Marketing uses `MarketingHeader` with the **same mark asset**.

#### Acceptance criteria
- [ ] One component owns authenticated chrome  
- [ ] Analyze ↔ Dashboard navigation always visible and consistent  

#### Effort / dependency
**S.**

#### Owner
Eng + Design

---

### D1-06. Results & history: one case-review pattern
**Status: DONE** — `components/case/case-review.tsx` used by analyze + HistoryDetailModal. Deprecate leftover `modern-prediction-results.tsx` wrapper when safe.

#### Problem
Live results (`modern-prediction-results` + page layout) and `HistoryDetailModal` teach two different visual languages for the same data.

#### Impact
Cognitive friction; one path looks unfinished.

#### Improvement plan
1. Extract `CaseReview` presentational component: prediction band + dual image stage + meta.  
2. Use it in analyze (complete state) and history modal.  
3. History cards remain compact summaries that open the same review pattern.

#### Acceptance criteria
- [ ] Analyze complete state and history detail share layout DNA  
- [ ] Prediction styling identical in both  

#### Effort / dependency
**M.** After D0-03.

#### Owner
Eng + Design

---

## 8. P2 — Credibility, motion, a11y & polish

---

### D2-01. Trust & disclaimer design (not just legal text)
**Status: DONE** — ResearchDisclaimer, IntendedUseGate, home intended-use section, CaseReview “model suggestion” + Grad-CAM attention copy.

#### Problem
Marketing overclaims; analyze results present binary cancer labels without designed caution.

#### Impact
Dangerous UX for a medical-adjacent tool; erodes serious buyers.

#### Evidence
Hero copy promising accuracy/diagnosis clarity; results show Malignant/Benign large with no persistent research framing.

#### Improvement plan
1. Persistent quiet disclaimer bar on analyze + results + history detail.  
2. Marketing trust section: intended use, data domain (e.g., breast histopathology research), Grad-CAM explanation.  
3. Visual treatment: calm, not alarmist yellow banners — clinical footnote density.  
4. Align with `IMPROVEMENTS.md` P0-01 (intended use acceptance).

#### Acceptance criteria
- [ ] Disclaimer visible without scrolling on results  
- [ ] Marketing does not claim device-grade diagnosis  
- [ ] Grad-CAM labeled as model attention, not proof  

#### Effort / dependency
**M.** Product + legal copy.

#### Owner
Product + Design

---

### D2-02. Motion budget
**Status: PARTIAL** — `useReducedMotion` gates DarkVeil. Still stacked veil + Framer on home/guide/nerds — pick one primary atmosphere.

#### Problem
DarkVeil continuous shader + framer page staggers + landing parallax + pulse dots + dashboard hover lifts = noisy presence.

#### Impact
Feels decorative; can hurt performance and clinical seriousness.

#### Improvement plan
1. Define journey budgets:  
   - Marketing: 1 atmosphere + 1 entrance  
   - Analyze: progress transitions only  
   - Dashboard: hover on interactive cards only  
2. Prefer CSS for simple fades; reserve Framer for orchestrated moments.  
3. Respect `prefers-reduced-motion`.

#### Acceptance criteria
- [ ] Reduced-motion disables shader/parallax/pulse  
- [ ] No page uses more than 3 concurrent motion systems  

#### Effort / dependency
**S–M.**

#### Owner
Design + Eng

---

### D2-03. Rename and contextualize the assistant
**Status: DONE** — Product no longer ships Gemini chat. If assistant returns later, use HistoAI naming + case context (never vendor chrome; never `NEXT_PUBLIC_` keys — see eng P0-03).

#### Problem
UI says “Gemini copilot” — vendor brand inside product; chat isn’t tied to a selected case; starter prompts imply context that isn’t wired.

#### Impact
Looks bolted-on; breaks immersion; trust leak.

#### Evidence
`GeminiChat.tsx` — “Gemini copilot”, starter prompts about latest result without binding.

#### Improvement plan
1. Rename to **HistoAI Assistant** (or “Case assistant”).  
2. When a history item / latest case is selected, show a context chip (prediction, date).  
3. Empty state copy honest if no case selected.  
4. Visually match panel radius/tokens to dashboard diet.

#### Acceptance criteria
- [ ] No “Gemini” word in customer-facing UI  
- [ ] Context chip appears when a case is in scope  

#### Effort / dependency
**S–M.** May need light eng for context props.

#### Owner
Product + Design + Eng

---

### D2-04. Accessibility pass
**Status: OPEN**

#### Problem
Design not audited for keyboard, contrast, focus, screen readers — especially custom dropzone and shader backgrounds.

#### Impact
Exclusion; risk for institutional buyers with a11y requirements.

#### Improvement plan
1. Keyboard: dropzone operable; modal focus trap; visible focus rings using `--ring`.  
2. Contrast: emerald-on-mint eyebrows and muted text checked.  
3. Labels: prediction not color-only (icon + text).  
4. `alt` text for slide/heatmap.  
5. axe/lighthouse a11y in CI optional later.

#### Acceptance criteria
- [ ] Full analyze flow completable by keyboard  
- [ ] Malignant/benign not conveyed by color alone  
- [ ] Focus states visible on all primary controls  

#### Effort / dependency
**M.**

#### Owner
Design + Eng

---

### D2-05. Empty / loading / error as a designed system
**Status: PARTIAL** — Dashboard empty/loading good; analyze has stages; add explicit backend-unhealthy banner before upload.

#### Problem
Dashboard loading is branded; analyze loading is a generic spinner; errors are basic alerts; marketing has no “states.”

#### Impact
Uneven quality; analyze feels cheaper.

#### Improvement plan
1. Shared `StatePanel` patterns: loading, empty, error, offline backend.  
2. Analyze error: recovery actions (retry, choose another file, back to dashboard).  
3. Backend unhealthy: designed banner before upload.

#### Acceptance criteria
- [ ] Analyze loading matches dashboard craft  
- [ ] Error states include next actions  

#### Effort / dependency
**S–M.**

#### Owner
Design + Eng

---

### D2-06. ThemeProvider / dark mode decision
**Status: OPEN** — Decide light-only for v1; remove or fully wire ThemeProvider.

#### Problem
Dark tokens + unused ThemeProvider = unfinished story.

#### Impact
Confusion; dead code.

#### Improvement plan
1. **v1 decision: light only** (recommended for clinical calm).  
2. Remove unused provider from consideration or wire a real toggle with full QA.  
3. Don’t ship half a theme.

#### Acceptance criteria
- [ ] Either dark mode works end-to-end or dead code/tokens are clearly marked unused  

#### Effort / dependency
**S.**

#### Owner
Eng + Design

---

### D2-07. Responsive & mobile craft
**Status: OPEN** — Needs dedicated critique on analyze results stack + dashboard.

#### Problem
Dashboard multi-panel layout and analyze three-column results may collapse poorly; marketing hero type sizes need scrutiny on small screens.

#### Impact
Mobile researchers/demo-on-phone suffer.

#### Improvement plan
1. Analyze results stack: prediction → images carousel/stack.  
2. Dashboard: assistant below history on small screens; sticky compact CTA.  
3. Touch targets ≥ 44px on upload and primary buttons.

#### Acceptance criteria
- [ ] iPhone-width critique of analyze + dashboard passes  
- [ ] No horizontal scroll on primary flows  

#### Effort / dependency
**M.**

#### Owner
Design + Eng

---

## 9. P3 — Nice-to-haves

| ID | Item | Plan | Effort |
|----|------|------|--------|
| D3-01 | Custom illustration / micro-diagram of pipeline | One editorial diagram, not icon row | M |
| D3-02 | Sample slides gallery for first-run | Designed picker with captions | M |
| D3-03 | Printable / PDF case report layout | Typography-led report matching brand | L |
| D3-04 | Onboarding coach marks | 2–3 steps max, dismissible | S |
| D3-05 | Preferential reduced-chrome “focus mode” on analyze | Hide chrome during review | S |
| D3-06 | Sound-off micro-haptics / subtle complete chime | Optional, off by default | S |
| D3-07 | Marketing OG image + social card | Brand + real slide crop | S |
| D3-08 | Delete duplicate components (`gemini-chat.tsx`, old upload/results) | Reduce design drift | S |

---

## 10. Per-surface redesign briefs

### 10.1 Marketing `/`

**Job:** Convert the right user; set honest expectations.  
**Hero:** Brand-forward, real pathology visual, one CTA.  
**Sections:** How it works (3) · Trust/limitations · CTA.  
**Do not include in first viewport:** stats, feature grids, college bio, pulse badges.  
**Motion:** One atmosphere treatment max.

### 10.2 Auth

**Job:** Frictionless entry without breaking brand.  
**Look:** Soft wash + single card + canonical mark.  
**Copy:** Short; no medical claims on the form.

### 10.3 Analyze

**Job:** Capture slide → show model suggestion clearly → enable next action.  
**States:** idle upload · progress · results · error.  
**Hierarchy:** Prediction > images > meta > actions.  
**Chrome:** Shared `AppHeader`; task title, not slogan.

### 10.4 Dashboard

**Job:** Orient returning user; open a past case; start a new one; optional ask assistant.  
**Hierarchy:** History first; summary once; assistant secondary.  
**Empty:** Designed first-run, not zeroed KPIs.

### 10.5 History detail

**Job:** Same as analyze results — case review.  
**Share:** `CaseReview` component with analyze.

---

## 11. Information architecture

### Current (problem)

```text
/  and  /landing   →  conflicting CTAs
auth               →  dashboard (metrics-first)
dashboard          →  analyze
analyze            →  (results) → back to dashboard
```

### Target

```text
/                  →  sign-up | sign-in
auth               →  dashboard (if history) OR analyze (if empty)  [product choice]
analyze            →  primary tool
dashboard          →  archive + assistant + launch analyze
```

**Product recommendation:** After first login with empty history, land on **Analyze** (or dashboard empty-hero that is analyze-equivalent). Do not force a metrics dashboard as the first product moment.

### Nav model (authenticated)

| Item | Destination |
|------|-------------|
| Mark | Dashboard |
| New analysis | Analyze |
| History | Dashboard `#history` |
| Assistant | Dashboard assistant panel / optional later route |
| Account | Logout (+ future settings) |

---

## 12. Content & voice

### Voice attributes
- Clear, calm, precise  
- Scientific humility > hype  
- Short sentences in UI; no “harness the power”  

### Ban / replace list

| Avoid | Prefer |
|-------|--------|
| Unprecedented accuracy | Model suggestion with confidence |
| Cancer diagnosis (as product promise) | Histopathology image analysis (research) |
| Clinical decision-making (overclaim) | Decision-support / research review |
| Gemini copilot | HistoAI Assistant |
| Get Started → random routes | Get started → sign-up |
| From a College Project… (hero-adjacent) | Move to footer About, or drop |

### Microcopy needs
- Upload constraints  
- Progress stage labels  
- Inconclusive / low-confidence (when eng adds it)  
- Disclaimer one-liner  
- Empty history  
- Backend unavailable  

---

## 13. Design tokens & component rules

### Color (conceptual)

| Token | Role |
|-------|------|
| `--background` / page wash | Soft mint-white clinical |
| `--primary` | Brand / actions |
| `--malignant` | Deep rose/ink (not neon) |
| `--benign` | Primary green family |
| `--panel` | White elevated surface |
| `--border-subtle` | Emerald-tinted hairline |

### Type scale (guidance)

| Role | Size guidance |
|------|----------------|
| Brand hero | Display, large |
| Section H2 | Semibold sans or display small |
| Body | 16–18px / relaxed |
| Eyebrow | Rare; ≤1 per section |
| Prediction | Display, dominant |

### Component rules
- **Button primary:** solid primary, medium radius, not pill  
- **Panel:** border + soft shadow; no glow radials on stats  
- **Card:** interactive list items / forms / chat only  
- **Upload:** large hit area; dashed border using primary at low opacity  
- **Progress:** stage label + bar; avoid duplicate confidence encodings  

---

## 14. Anti-patterns to ban

Do not introduce or reintroduce:

1. Purple / indigo decorative gradients on a green medical brand  
2. Pulse-dot pill badges (“AI-Powered…”)  
3. Gradient-clipped headline text as the main brand moment  
4. Inset floating hero mockups / abstract SVG “product shots”  
5. Feature grids of 6 icon cards with hover-lifts as the main value prop  
6. Stat strips that restate the same numbers already on screen  
7. Neon red/green candy diagnosis typography  
8. Vendor names (Gemini) in chrome  
9. `rounded-full` primary CTAs on clinical surfaces  
10. College-project origin as a near-hero section  
11. Dark-mode glow / glassmorphism stacks without purpose  
12. Multiple competing landings  

---

## 15. Phased delivery plan

### Phase Design-A — Unify identity — **MOSTLY COMPLETE**
- [x] D0-01 One marketing route  
- [~] D0-02 Logo + CTA map (AppHeader primary still open)  
- [x] D0-05 Auth brand alignment  
- [x] B-03 Remove v0 metadata  
- [~] D1-05 Shared AppHeader (component exists; primary action missing)  

### Phase Design-B — Clinical core — **MOSTLY COMPLETE / FINISH DIET**
- [~] D0-03 Analyze rebuild (shipped core; polish upload hero)  
- [~] D0-04 Dashboard diet (finish metric/CTA pass)  
- [x] D1-06 Shared CaseReview  
- [x] D2-01 Disclaimer design  
- [~] D2-05 Loading/error system  

**Remaining exit criteria:** dashboard no longer triples metrics; AppHeader has one solid primary CTA.

### Phase Design-C — System & marketing craft — **NEXT**
- [~] D1-01 Tokens enforced  
- [~] D1-02 Typography roles  
- [ ] D1-03 Landing anti-cliché + **real slide visual**  
- [~] D1-04 Radius unification  
- [~] D2-02 Motion budget  
- [x] D2-03 Assistant (removed)  
- [ ] B-01 DESIGN_SYSTEM.md  
- [ ] Delete orphan landing kit  

**Exit:** Brand test passes with real product imagery; no gradient-clip / purple template files.

### Phase Design-D — Depth — **NOT STARTED**
- D2-04 a11y · D2-07 mobile · D2-06 theme decision · P3 items  

---

## 16. Success metrics & critique checklist

### Critique checklist (use in PR review)

**Brand**
- [ ] First viewport still HistoAI without nav?  
- [ ] Same mark as app shell?  

**Composition**
- [ ] One job in this section?  
- [ ] Hero budget respected on marketing?  

**Clinical**
- [ ] Prediction hierarchy clear?  
- [ ] Disclaimer present on results?  
- [ ] Color not the only signal?  

**System**
- [ ] Uses tokens (no rogue purple/gray dialect)?  
- [ ] Radius matches scale?  
- [ ] Cards only if interactive?  

**Motion**
- [ ] Within budget?  
- [ ] Reduced-motion respected?  

### Qualitative success
- External designer cannot tell marketing and app were built in different eras.  
- Pathologist/researcher demo: “this feels serious” > “this looks like a student hackathon UI.”

### Quantitative (optional)
- Signup CTR from hero CTA  
- Time-to-first-upload after signup  
- Drop-off on analyze  
- Mobile bounce on `/`

---

## 17. File inventory (what to touch / delete)

### Still high touch (remaining work)
| Path | Action |
|------|--------|
| `frontend/app/page.tsx` | Real slide/Grad-CAM hero; kill gradient-clip |
| `frontend/components/layout/app-header.tsx` | Render solid New analysis from `showPrimaryAction` |
| `frontend/app/dashboard/page.tsx` | Single summary; one primary CTA |
| `frontend/components/simple-image-upload.tsx` | Taller hero upload stage |
| `docs/DESIGN_SYSTEM.md` | **Create** from live tokens |
| `frontend/components/theme-provider.tsx` | Delete or wire |

### Delete / quarantine (do now)
| Path | Why |
|------|-----|
| `components/landing/hero-section.tsx` | Unused template; pills/parallax |
| `components/landing/features-section.tsx` | Purple/indigo icon gradients |
| `components/landing/cta-section.tsx` | Dead Watch Demo / Learn More |
| `components/landing/navigation.tsx` | Old mark / CTA map |
| `prediction-mode-selector.tsx` | Dead Gemini-era control |
| `StatCard.tsx` if unused | Glow kit drift |
| Old `image-upload` / `results-display` / `prediction-results` / `modern-prediction-results` if unused | Prefer `CaseReview` only |
| Keep `dark_veil.tsx` only if still used by `/` | Until hero imagery replaces it |

### Already landed (leave alone unless polishing)
| Path | Status |
|------|--------|
| `components/brand/logo.tsx` | Done |
| `components/layout/app-header.tsx` / `marketing-header.tsx` / `site-footer.tsx` | Done (finish primary CTA) |
| `components/case/case-review.tsx` | Done |
| `components/intended-use-gate.tsx` / `research-disclaimer.tsx` | Done |
| `app/analyze/page.tsx` | Core rebuild done |
| `app/auth/**` | Brand wash done |
| `app/landing/page.tsx` | Redirect done |
| `app/guide`, `app/nerds` | New IA pages shipped |

---

## 18. Appendix A — Proposed brand kit

### Name & lockup
- **Wordmark:** HistoAI  
- **Mark:** Microscope in emerald rounded square (24–44px)  
- **Clear space:** ≥ 0.5× mark width  

### Color
| Name | Use |
|------|-----|
| Emerald primary | Actions, mark, key lines |
| Mint wash | Page backgrounds |
| Ink slate | Primary text |
| Soft slate | Secondary text |
| Deep rose | Malignant semantic |
| White | Panels |

### Type
| Role | Family |
|------|--------|
| Display | Space Grotesk (or chosen replacement — one only) |
| UI/Body | DM Sans |

### Imagery
- Real histopathology crops  
- Grad-CAM overlays as explanatory frames  
- Avoid stock “AI brain” / abstract 3D  

### Photography treatment
- Slight cool/neutral grade  
- No heavy neon overlays on marketing hero  

---

## 19. Appendix B — Wireframe priorities (text)

### Marketing hero
```text
[ Mark wordmark large ]
[ One headline ]
[ One sentence ]
[ Primary CTA ] [ Sign in ]
[ Full-bleed slide / attention visual ]
```

### Analyze idle
```text
[ AppHeader ]
[ Title: Upload a slide ]
[ Large dropzone ~~~~~~~~~~~~~~~~ ]
[ Constraints + optional samples ]
```

### Analyze results
```text
[ AppHeader ]
[ Disclaimer ]
[ PREDICTION band (dominant) ]
[ Probabilities ]
[ Original image | Heatmap ]
[ New analysis ]
```

### Dashboard (returning)
```text
[ AppHeader — New analysis ]
[ Welcome + single summary ]
[ History list ########## ] [ Assistant ]
```

### Dashboard (empty)
```text
[ AppHeader ]
[ Empty hero: Run your first analysis ]
[ Short how-it-works inline ]
```

---

## 20. Appendix C — Relationship to engineering IMPROVEMENTS.md

| Design item | Engineering dependency | Eng status |
|-------------|-------------------------|------------|
| Disclaimer UI (D2-01) | P0-01 intended use | **PARTIAL** (UI done) |
| Analyze progress stages | P1-01 job status | **OPEN** (UI timers for now) |
| Heatmap / media | P0-05 object storage | **OPEN** |
| Assistant | P0-03 | **DONE** (removed) |
| Inconclusive styling | P2-03 abstain | **OPEN** |
| Home proof imagery | Can ship without eng | Design-only |

---

## Final recommendation

**Stop re-doing:** one route, Logo, auth wash, CaseReview, trust UI, Gemini removal.

**Still fix (design):**
1. Home — real pathology visual; kill gradient-clip  
2. AppHeader — solid New analysis  
3. Dashboard — one summary + one CTA  
4. Delete orphan landing kit + write DESIGN_SYSTEM.md  
5. Motion / a11y / mobile depth  

Align with eng Phase B (auth, storage, Docker) so design doesn’t outrun a still-open inference API.

---

### Changelog

| Date | Note |
|------|------|
| 2026-07-28 | Initial design spec |
| 2026-07-29 | Re-audit: §0 remaining backlog; Status on all items; Phases A–B mostly complete |
| 2026-07-29 | Shipped remaining design backlog: home slide visual, AppHeader CTA, dashboard diet, orphan kit deleted, DESIGN_SYSTEM.md, motion/a11y |

*Prefer updating Status lines and §0 as work ships.*
