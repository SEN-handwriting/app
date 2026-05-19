# Mobile Writing System — Design Spec
Date: 2026-05-14

## Objective
Make the entire app mobile-first, with particular focus on the drawing/writing system being fully usable on touch screens. Keep the existing dark zinc/green theme. No extra buttons or UI clutter.

## Scope

### In scope
- `DrawCanvas` — fluid responsive mode
- `PracticeGrid` — fluid canvas + Tailwind migration
- `WordPracticeGrid` — fluid canvas sizing
- `apps/web/src/app/langue/[lang]/[course]/learn/page.tsx` — verify fluid wiring
- `apps/web/src/app/revision/page.tsx` — verify fluid wiring

### Out of scope
- Dashboard, Langue pages, Sign-in/up, Profile (already mobile-friendly)
- New features or behavioral changes to the writing logic

---

## Architecture

### 1. DrawCanvas — Fluid mode

**New prop:** `fluid?: boolean`

When `fluid` is true:
- The canvas is wrapped in `<div ref={containerRef} className="w-full">`
- A `ResizeObserver` watches the container and updates `logicalSize` state (width = height, square)
- Canvas internal resolution = `logicalSize * devicePixelRatio`
- All existing guide, stroke, and pointer logic scales with `logicalSize`
- When `fluid` is false (default): behavior unchanged (backwards compatible)

**Why ResizeObserver over window.innerWidth:** works inside any container width, handles orientation change, handles desktop resize.

### 2. PracticeGrid — Fluid + Tailwind

- Pass `fluid` to `DrawCanvas`
- Replace all `style={{ ... }}` inline with Tailwind classes
- Button sizing: `h-12 rounded-xl` (min 48px touch target)
- Colors stay in theme: red-500 for clear, zinc-600 for restart
- Feedback banners use `rounded-xl border` Tailwind pattern consistent with rest of app
- Progress bar uses existing `bg-zinc-800 / bg-green-500 / bg-blue-500` pattern

### 3. WordPracticeGrid — Responsive layout

- Wrap the letter grid in a `ref` container
- Measure container width via `ResizeObserver`  
- Compute `canvasSize` dynamically: `floor((containerWidth - gap*(perRow-1)) / perRow)`
- `perRow` logic from existing `getLayout()` stays the same
- Pass computed `canvasSize` to each `LetterBox` / `DrawCanvas`

### 4. Learn page

- Already has `grid-cols-1 md:grid-cols-2` — no structural change needed
- On mobile: vertical scroll (model on top, practice below) — already the case
- Just ensure `PracticeGrid` gets fluid canvas (handled by PracticeGrid change above)

### 5. Revision page — practice mode

- Same: `grid-cols-1 md:grid-cols-2` already in place
- `PracticeGrid` with fluid canvas handles the rest

---

## Mobile UX decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Canvas size on mobile | Full width (~343px on 375px screen) | Max drawing surface for cursive |
| Learn/Revision layout | Vertical scroll (model → practice) | Already implemented, natural flow |
| Canvas aspect ratio | Always square (width = height) | Character writing needs equal axes |
| Touch events | PointerEvent (already in use) | Works natively on mobile, no change needed |
| Button min size | 48px height (`h-12`) | Apple HIG / Material touch target standard |

---

## Files to modify

1. `apps/web/src/components/DrawCanvas.tsx`
2. `apps/web/src/components/PracticeGrid.tsx`
3. `apps/web/src/components/WordPracticeGrid.tsx`
4. `apps/web/src/app/langue/[lang]/[course]/learn/page.tsx` (verify, minor if needed)
5. `apps/web/src/app/revision/page.tsx` (verify, minor if needed)

---

## Non-goals
- No new navigation patterns (tabs, swipe gestures)
- No changes to stroke validation logic
- No new animations or transitions beyond existing ones
