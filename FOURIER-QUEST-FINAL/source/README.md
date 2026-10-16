# FOURIER QUEST

A Japanese, child-friendly Fourier epicycle puzzle and creative studio. React + TypeScript, Canvas 2D, procedural Web Audio, IndexedDB, service worker. No analytics, external asset requests, or application backend.

## Run and build

`npm ci`
`npm run build`

Serve `dist/` from any static host. All resource URLs are relative, including the service worker, for GitHub Pages subdirectory compatibility.

## Verification

- `node tests.mjs`: independent spectral-vs-sampled scoring verification, all 40 target witnesses, discrete coordinate solver, frequency periodicity, star boundaries, DFT input reconstruction. All 40 stages solved at 100; all starting scores below 70.
- `npx tsc --noEmit`: strict TypeScript.
- `node integration-tests.mjs`: DOM integration tests with fake IndexedDB: startup, map locks, 40 stage entries, scoring, stars, unlocking, undo/redo, hints, dialog keyboard escape, save/reload, gallery, creation presets, adding/removing circles, drawing mode.
- DOM tests stub Canvas. Actual Canvas appearance, mobile gestures, physical-device audio/FPS, offline hosting behavior, and child playtesting are not verified by these tests.

## Design

Stages are declarative JSON in `src/stages.json`; `generate-stages.mjs` generates the current authored set. Math is in `src/engine.ts`, persistence in `src/storage.ts`, audio in `src/audio.ts`, UI/rendering in `src/app.tsx`.

Scoring uses 512 time-aligned samples, E = RMS distance, S = 100 max(0,1-E/D). D is calibrated to 1.8 times the coefficient RMS radius instead of the provisional bounding-box diagonal, so wrong-frequency starting shapes cannot auto-clear. Thresholds remain 70/85/95. Stage 6 uses three circles and radius-only edits. Zero-radius circles in budget stages are inactive circles; slots cannot exceed each stage's budget.

Creation supports direct editing up to 128 circles. Hand-drawn closed contours are arc-length resampled to 256 points, centered, and decomposed by direct complex DFT. Strongest 8/16/32/64/128 coefficients can be retained. The bounded DFT is used instead of an FFT library to keep the static bundle self-contained.

Progress, best unaided scores, settings, current puzzle and up to 100 discoveries save locally. Browsing data deletion removes them. First interaction enables Web Audio as required by browsers. Hints are unlimited and free; skins unlock at 6 and 12 stars. Reduced motion disables continuous circle movement and decorative animation.
