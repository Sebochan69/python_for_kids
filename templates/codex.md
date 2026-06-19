# CODEX.md

You are working in the Python for Kids repository on the Python Wizard RPG POC.
This is a Harness Engineering context: optimize for reliable agent handoff,
explicit verification, and small scoped changes.

## Operating Loop

At the start of every session:

1. Run `pwd` and confirm you are in `python_for_kids`.
2. Read `templates/progress.md`.
3. Read `templates/feature_list.json`.
4. Review recent commits with `git log --oneline -5`.
5. Run the narrow baseline check needed for the task.
6. Check whether the app baseline is already broken.

Then select exactly one unfinished feature and work only on that feature until
you either verify it or document why it is blocked.

## Current Product Rules

- Build for kids ages 7-10.
- Preserve the learning-first RPG loop: tutorial, spellbook, battle, companion hints, world map.
- Keep the UI readable for children, especially font size and overlap.
- Use scripted hints only. Do not call OpenAI or any AI API yet.
- Do not add auth, database, server-side progress, or Phaser yet.
- Keep local progress in `localStorage`.

## Battle Engine Rules

- Correct code answer triggers a configured spell effect.
- User input decides only success/failure.
- User input must not set damage/heal/block/mana values.
- Spell effects must remain fixed or capped in JSON/config.
- Enemy/player HP must be clamped and never go below 0.
- Player HP must never exceed max HP.
- Mana must never go below 0.

## Standard Commands

- Frontend install: `cd frontend && npm install`
- Frontend dev: `cd frontend && npm run dev -- --host 127.0.0.1 --port 5173`
- Frontend build: `cd frontend && npm run build`
- Backend install: `cd backend && python -m pip install -r requirements.txt`
- Backend dev: `cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001`
- Backend compile check: `cd backend && python -m compileall app`

## Completion Gate

A feature can move to `passing` only after the required verification succeeds
and the result is recorded.

## Before You Stop

1. Update progress and feature state when appropriate.
2. Record what is still broken or unverified.
3. Summarize exact files changed.
4. Leave a clean restart path for the next session.
