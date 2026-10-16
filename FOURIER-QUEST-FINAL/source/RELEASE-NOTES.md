# FOURIER QUEST 1.2

Journey-map driven update aimed at keeping children engaged from the first 10 seconds to stage 40 (see `docs/journey-map.md` at the repository root).

- **40 distinct puzzles.** In 1.1, stages 8–40 (except budget stages) were the same puzzle (circle 1 → 55, circle 2 → 24). Stages are now hand-designed in `generate-stages.mjs`: W1 teaches one idea per stage (new: ST8 star points = speed + 1, ST10 two-mistake graduation), W2 combines ideas on flowers, W3/W4 are spot-the-difference puzzles with every circle editable and a 🔍 mistake count (1 → 4). Every stage has its own mission and discovery text.
- **First 10 seconds.** Pulsing ring and "ここを ひっぱってね" on the grab point in ST1–3; larger handle; touch hit area 24 → 32 px. ST1/ST2 now start at a non-zero score so the first press visibly helps.
- **Warmer / colder.** Live closeness chip on the canvas ("🔥 あったかい！" / "❄ つめたい…"), quest pitch rises with closeness, "おしい！" at 60–69 %.
- **Click into place.** While dragging, radius snaps within ±2 and angle within ±6° of the model (quests only).
- **Clear card.** Stars pop in over the canvas with confetti (off with reduced motion) and an in-place "つぎへ" button, so phones no longer need to scroll to continue. Compact strip for ★/★★, full card for ★★★ and world clears. The card waits until the finger lifts.
- **Sticker book.** 12 stickers in the discovery book with a toast when earned; older saves get earned stickers silently.
- **Six ink colours** unlocked at ★0/6/12/24/45/80 (rainbow at 80).
- **Map** marks the next stage with NEW. Header nav buttons have accessible names on phones.
- Test solver tries several natural play orders; new `delight-tests.mjs`; `npm test` runs every suite; `npm run release` refreshes `../web` and `../index.html`.

Not verified: child playtesting, iPhone/iPad hardware, real audio output. W4 difficulty (3–4 mistakes) in particular needs playtesting.

# FOURIER QUEST 1.1

Journey review fixes: compact mobile observation + independently scrolling workbench; stage 4 isolates speed; stage 5 direction hints; quest/studio drafts and selected-circle restoration; named, tagged discoveries; optional progressive tracing; reduced decoration with slow functional rotation; pointer hit regions and stable zoom during drag; narrower introductory scoring; budget challenge achievement; clearer text; explicit saving state; scoped offline cache update.
