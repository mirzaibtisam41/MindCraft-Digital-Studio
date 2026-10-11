# Mindcraft Digital Studio — UI/UX Design Spec (V2)

Source: `AI-Image-Studio-UIUX-Concept-v2.pdf` (25 pages: cover, design system, 15 desktop screens/modals, UI-states sheet, tablet + 4 mobile screens). Mock content only — model names like "Nova Ultra v3", "Nova Vision", "Flux Rapid" and all prices are placeholders.

**Principles:** dark-first · desktop-first, responsive down to 390px · Geist / Geist Mono · **one violet accent** · calm surfaces, zero clutter · controls adapt to the selected model's capabilities (unsupported settings are disabled/hidden with a note, never faked).

## 1. Design tokens

### Color
| Token | Hex | Use |
|---|---|---|
| ground-0 | `#0A0A10` (cover: `#0B0B11`) | app ground |
| ground-1 | `#0D0D14` | sidebar |
| surface | `#12121B` | cards |
| raised | `#1A1A26` | hover |
| border | `#1F1F2C` / `#262634` | borders |
| ink-1 | `#F0EFF8` | primary text |
| ink-2 | `#A7A6BD` | secondary text |
| ink-3 | `#8886A3` | muted (never below 11px) |
| accent | `#887CFF` (cover: `#7C6CFF`) | links, focus |
| accent-grad | `#7C6CFF → #5A48E0` | primary buttons |
| accent-tint | accent @ 15% | selection |
| success | `#3ECF8E` | |
| warning | `#F5B14C` | |
| danger | `#F2607A` | |
| modal surface | `#14141F` | modals |

Semantic colors are only for status and always travel with an icon or label. All text ≥ 4.5:1 contrast on its surface.

### Typography (Geist; Geist Mono for numbers)
| Style | Size | Weight / tracking |
|---|---|---|
| Display | 30 | 650, -0.025em |
| Heading 1 | 22 | 650, -0.02em |
| Heading 2 | 15 | 600 |
| Body | 13.5 | 400, line-height 1.6 |
| Small | 12.5 | 400 |
| Overline (section labels) | 10.5 | 600, caps |
| Mono | 12 | Geist Mono — seeds, sizes, credits, hashes, dates |

### Spacing & radius
- 4px grid: 4, 8, 12, 16, 24, 32, 48
- Radius: 8 small · 10 controls · 14 cards · 18 modals · pill for chips

### Elevation, states & motion
- Hover lifts one surface step (+1). Focus = 2px accent ring. Disabled = 40% opacity.
- Modal: radius 18, deep soft shadow, 60% scrim.
- Motion: 160–240ms ease-out fades and 4px rises; press settles at 98% scale. **No bounces.**
- Icons: single-weight 1.8px rounded strokes, 16–20px, `currentColor` (Lucide-style). No emoji, no filled-icon mixing.

## 2. Components
- **Buttons:** one gradient Primary per view (e.g. "Generate"), Secondary, Ghost, Delete (danger outline), Disabled. Sizes Large 44 / Default 36 / Small 30. Icon-only buttons need an accessible label + ≥32px hit area + tooltip.
- **Inputs:** text field, select, slider with mono value (e.g. Strength 0.65), segmented control (1:1 / 16:9 / 9:16 / 4:3), toggle, search with icon.
- **Chips:** style presets (Photorealistic, Cinematic, Anime, 3D render…); selected = accent tint + accent border.
- **Status badges (dot + label):** Completed (green), Processing (violet), Queued (grey), Failed (red), Low credits (amber).
- **Credit pill:** ⚡ 2,450 credits — lives in the top bar on every screen.
- **Image tiles:** label bottom-left; selected = accent ring + check badge top-left; hover reveals action buttons (download / edit / regenerate).
- **Row card:** thumbnail · title · mono meta · actions/status.
- **Toasts:** bottom-right, stack of 3, auto-dismiss 6s, hover pauses. Tooltips 400ms delay, show shortcut (e.g. "Regenerate · R").

## 3. App shell (desktop)
- **Left sidebar** (ground-1): logo "Mindcraft Digital Studio / Creative workspace" (mockups say "AI Image Studio" — old working title).
  - WORKSPACE: Dashboard, Image Generator, Image Editor, Image to Image, AI Vision
  - LIBRARY: My Creations, Projects, Generation History, Prompt Studio
  - ACCOUNT: Usage & Credits, Billing, Settings
  - Bottom: Credits card (balance, progress bar, "62% remaining", Top up)
  - Active item = accent-tint background + border.
- **Top bar:** breadcrumb (`Workspace / Dashboard`), global search, credit pill, notifications bell (dot when unread), avatar + name.

## 4. Screens
1. **Dashboard** — "Good evening, {name}" + month stat; Browse prompts / Create image buttons; hero quick-prompt bar with model chip + Generate; 3 quick-action cards (Image Editor, Image to Image, AI Vision); Recent creations grid (8, hover actions) + View all; Recent projects (3 row cards); right column: Generations-this-month bar chart (today highlighted, % change badge), credits donut (2,450 / 4,000), "Try tonight" prompt suggestion (Use prompt / More ideas).
2. **Image Generator** — left panel: Prompt (char counter 184/2,000, Enhance prompt, Clear, suggestion chips) · Model card (name, "2 cr / image", capability chips e.g. Inpainting / Img2Img / HD 2048px, strikethrough for unsupported like Negative prompt, note "Controls adapt to the selected model") · Aspect ratio segmented · Resolution select + Images stepper · Style preset chips · Advanced (Seed, Guidance slider, Negative prompt disabled if unsupported) · sticky cost card: "Estimated cost 8 credits · 4 × 2 cr", "Generate 4 images", "Balance after run". Right: Results header (badges "1 processing · 2 queued", Full history) · large selected image ("Selected · 1 of 4", expand, Download / Save to project / variations / edit / duplicate / regenerate) · meta line (prompt · model · size · ratio · seed · cr · Details) · 4 thumbnails (one "Generating… / Cancel") · **Generation queue** list (Processing with progress + ~14s left + Cancel; Queued "#2 · 8 cr held" + Cancel; Completed + View; Failed "flagged by safety filter · 8 cr refunded" + Retry) · Clear finished. Note: progress bars only when the model reports progress, else indeterminate "Generating…".
3. **Image details modal** — image left (1 of 4, thumbnail strip, zoom "100% · fit", prev/next arrows), right: title + status, prompt + Copy, Model / Style preset / Dimensions / Seed·Guidance / Generated / Credits ("2 of 8 (batch of 4)"), Download PNG · 1024px (primary), Download 2× HD, Save to project, Variations, Edit image, "Regenerate with same settings · 2 cr".
4. **Image Editor** — top: filename + dims, undo/redo, Upload image, Export. Left tool rail: Select, AI Edit, Mask (M), Rem. BG, Repl. BG, Rem. obj, Crop, Resize, Variations. Canvas: mask toolbar (Masking · 1 region, + Add, − Subtract, Clear mask), Before / Split / After toggle, split-slider compare, zoom control (− 100% + Fit). Right: AI instruction (masked region) + "Apply edit · 3 cr" + note "Applies inside Mask 1 only · original kept in history"; Edit history list (0 Original upload 0 cr, steps with cost, Current badge, Revert all; selecting a step previews it, later steps restorable until a new edit); Export (format PNG, scale 2× 2048px, Download).
5. **Image Editor — empty state** — dropzone "Drop an image to start editing · PNG, JPG or WebP · up to 25 MB · stays private", Browse files / Pick from My Creations, recent creations; tools and side panels disabled with explanatory text.
6. **Image to Image** — left: reference image (filename · size, replace/remove) + drop new reference; Transformation prompt + Enhance; Style chips; Transformation strength slider (Stay close ↔ Reinvent, "hidden for models without strength control"); Aspect ratio incl. "Match ref"; cost card "6 credits · 3 × 2 cr" + "Transform — 3 variations". Right: Original vs generated (strength badge, arrow, Compare slider toggle, Download / Save to project), Variations row (v1–v3, selected).
7. **AI Vision** — left: analyzed image + Replace; "Ask AI Vision to…" chips (Describe image, Ask a question, Extract text · OCR, Identify objects, Analyze design, Generate caption); Previous analyses list. Right: chat-style Analysis (filename · model, New analysis): user bubble; result cards — Description (+ show full analysis), Objects detected (bars with % **only when model reports confidence**, else "detected" tag, with explicit note), Extracted text · OCR ("No readable text found"), Dominant palette (hex swatches); Copy / Use as prompt; cost "1 credit"; follow-up input + send.
8. **Prompt Studio** — left: Categories with counts; Saved prompts (title, preview, "Architecture · used 14×", + New). Center: Prompt editor (draft · autosaved), style chips, "Improve prompt"; Enhanced result card ("ENHANCED · CINEMATIC +42 descriptors", added descriptors highlighted in accent) with Use in Generator / Copy / Save prompt / Try another angle; Recently used (Reuse). Right: Templates with `[PLACEHOLDER]` slots + Use template; Tips ("The enhancer adds missing layers — it never rewrites your idea").
9. **My Creations** — header count; search; filters (All types, All models, Last 30 days, Favorites); grid/list toggle; Select mode; masonry grid with checkboxes, heart, hover actions (favorite, download, more, Reuse prompt, Edit); floating bulk bar (N selected · Download · Add to project · Favorite · Delete · Clear).
10. **Projects** — search, New project; cards with 2×2 image mosaic, name, "24 images · 2 collections · updated 2d ago"; dashed "Create project" card.
11. **Project detail** — cover, title, description, mono meta; Download all, Add images, more menu; collection chips (All · 24, Hero shots · 9, …, + New collection); image grid + dashed "Add from My Creations" tile.
12. **Generation History** — search, status chips with counts (All / Completed / Failed / Processing), model + date filters; table: Image, Prompt, Type (Generate / Img2Img / Edit / Variation), Model, Date (mono), Status, Credits (refunds green "+8"), Actions (Reuse / View, Cancel for processing, Retry / Details for failed); pagination "Showing 1–7 of 486".
13. **Usage & Credits** — month selector, Upgrade plan; stat cards (Balance donut, Consumed + % vs last month, Images generated, Avg credits/image); Usage by feature (single-hue bars: generation / editing / img2img / vision, cr + %); Daily credit consumption bar chart (today highlighted); Recent credit activity table (Date, Description, Type: Generation/Refund/Editing/Purchase/Plan, ±credits) + Export CSV.
14. **Billing** — current plan banner (Active, renews date, Manage plan / Cancel); Plans: Starter $12/800 cr, Pro $29/2,500 cr (current), Studio $79/8,000 cr (sample pricing); Credit packs (500 $8, 1,200 $18 best value, 3,000 $40, never expire); Payment method; Billing history table (Paid badge, PDF invoice).
15. **Settings** — left sub-nav (Profile, Preferences, Generation defaults, Notifications, Security, Appearance); Discard / Save changes in top bar. Profile (avatar, name, email, workspace, role); Generation defaults (model, aspect, Auto-enhance prompts, Save originals with edits); Notifications toggles (Generation complete, Failed generations, Low credit warnings <200, Product updates); Security (password, 2FA, active sessions); Appearance (Dark / Light / System, Reduce motion).
16. **Onboarding modal** — gradient header, "Welcome, {name}", 3 cards (Generate / Edit / Organize), "Try a first prompt" chips, step dots "1 of 3 · 60 free credits included", Take the tour / Start creating.

## 5. UI states & patterns (reuse everywhere)
- **Empty gallery:** icon, "Nothing here yet", CTA Create image.
- **Generation in progress:** "Generating… 64%" + "~14s remaining · model" only when measurable; Cancel.
- **Failed generation:** red-bordered card, plain reason, "Nothing was charged — credits back", Retry / Edit prompt, "8 credits refunded" badge.
- **Upload progress & validation:** file row with % bar; inline error "sketch.tiff isn't supported. Use PNG, JPG or WebP under 25 MB."
- **Credit exhaustion:** amber card "Not enough credits — this batch needs 8, you have 3", Top up credits / Generate 1 instead.
- **Loading skeleton:** 1.2s shimmer loop, replaces content 1:1, no layout shift.
- **Confirmation dialog:** "Delete 3 images? … can't be undone", Cancel / Delete images (danger).
- **Toasts:** success / failure (Retry) / low credits (Top up).
- **Dropdown menu:** Download PNG, Copy prompt, Add to project, divider, Delete (danger).
- **Notifications panel:** list with unread dot, Mark all read.

## 6. Responsive
- **Tablet:** sidebar collapses to icon rail (settings + avatar at bottom); dashboard 3-column grids.
- **Mobile (390px):** top bar = logo, credit pill, bell, avatar; **bottom tab bar: Home · Create · Library · Account**.
  - Mobile dashboard: quick prompt with arrow, 2×2 action grid, 2-col recent creations.
  - Mobile generator: prompt card + Enhance + counter, horizontal chip row (model / ratio / res / ×4), style chips scroll, results 2×2, sticky cost + "Generate 4 images".
  - **Settings bottom sheet:** grabber, model, aspect, resolution, images stepper, style, "Advanced — seed, guidance" row, cost + Apply settings.
  - **Fullscreen preview:** back, "2 of 4", heart, more; thumbnail strip; prompt; meta chips; Download + edit / variations / share.
  - **Mobile editor:** split compare with toggle, AI instruction + "3 cr" apply, horizontally scrolling tool bar.

## 7. Product/UX rules derived from the design (must hold in implementation)
- Cost is always estimated **before** running and shown as "N × M cr"; credits are **held** while queued, **refunded** on eligible failures, and the refund is visible.
- Never show fake progress percentages or invented confidence scores.
- Unsupported model features are disabled with an explanation, not hidden silently or faked.
- Edits are non-destructive; every step is listed with its credit cost and is restorable.
- Uploads: PNG / JPG / WebP up to 25 MB, private to the workspace.
