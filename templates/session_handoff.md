# Session Handoff

## Verified Now

- What is currently working: React/Vite frontend builds, Chapter 1 game data loads, battle engine applies fixed/capped spell effects, world map/progress flow exists, and skeleton soldier assets are wired into the first battle.
- What verification actually ran: `cd frontend && npm run build` passed on 2026-06-19 after recent battle asset work.

## Changed This Session

- Code or behavior added: Harness template details adjusted for the current Python Wizard RPG POC.
- Infrastructure or harness changes: Template feature tracker, progress log, startup script, quality document, evaluator rubric, and agent guidance now match this repository.

## Broken Or Unverified

- Known defect: No confirmed defect in the template changes.
- Unverified path: Manual browser feel check for skeleton soldier pose scale, projectile impact timing, and overlap at desktop/mobile sizes.
- Risk for the next session: The idle skeleton file is named `skeleten_idle.png`; code intentionally references that uploaded filename.

## Next Best Step

- Highest-priority unfinished feature: `pwrpg-006` JRPG feel, assets, animation timing, and layout polish.
- Why it is next: The core learning loop exists; the demo now needs visual feel and readability validation.
- What counts as passing: First battle can be played from start to finish with no overlap, readable text, correct projectile/impact timing, and clear enemy pose changes.
- What must not change during that step: Do not weaken battle engine safety rules; user input must not decide damage values.

## Commands

- Frontend startup: `cd frontend && npm run dev -- --host 127.0.0.1 --port 5173`
- Backend startup: `cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001`
- Frontend verification: `cd frontend && npm run build`
- Backend verification: `cd backend && python -m compileall app`
- Focused debug command: `cd frontend && npm run dev -- --host 127.0.0.1 --port 5173`
