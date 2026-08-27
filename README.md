# meeszon-site

My personal portfolio. The home page is a Windows 7 desktop with a browser window on it — project case studies open as their own draggable windows, and a portrait in the corner follows your cursor like it's making eye contact.

## Stack

- React 19 + Vite
- Plain CSS (`style.css`)
- Pre-rendered gaze frames (`public/faces/`) instead of any ML at runtime — a set of webp portraits quantized into a 13×13 grid, swapped based on cursor position

## Getting started

```bash
pnpm install
pnpm dev
```

Then build with `pnpm build`, preview with `pnpm preview`.

## Layout

- `src/components/FaceTracker.jsx` — the cursor-following portrait
- `src/hooks/` — gaze tracking + frame preloading
- `src/case-studies.ts` / `src/modal.ts` — project window content and behavior
- `public/faces/` — the pre-rendered gaze frames
- `CONTEXT.md` — naming conventions and domain concepts (FaceTracker, gaze grid, window chrome, etc.)

## Docs

See `CONTEXT.md` for the vocabulary used across this codebase (what counts as a "window" vs a "modal", how the gaze grid works, and so on) — worth a skim before touching the UI chrome or the face tracker.
