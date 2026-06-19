# AGENTS.md

This repository is a child-facing learning product and a Harness Engineering
POC. The goal is reliable, restartable progress: every session should leave the
repo clearer for the next agent or human.

## Project Snapshot

- Product: Python Wizard RPG POC, a browser-based JRPG coding RPG for kids ages 7-10
- Frontend: React 18, Vite, TypeScript
- Backend: FastAPI with `/health` and `/api/v1/run`
- Content: JSON lessons in `lessons/`, shared schemas in `shared/schemas/`
- Persistence: `localStorage` only
- No auth, database, Phaser, or real AI companion integration yet

## Startup Workflow

Before writing code:

1. Confirm the working directory with `pwd`.
2. Read `templates/progress.md` for the latest verified state and next step.
3. Read `templates/feature_list.json`.
4. Review recent commits with `git log --oneline -5`.
5. Run the narrow verification needed for the current task.
6. If the app baseline is already broken, fix or document that before adding new feature work.

## Working Rules

- Work on one feature at a time.
- Keep changes within the active ticket or feature.
- Prefer existing local patterns over new abstractions.
- Do not silently change verification rules during implementation.
- Do not add backend, AI, auth, database, or persistence features unless the ticket asks for them.
- Keep child-facing wording simple, warm, and non-shaming.
- Do not ask children for personal information.
- Do not expose raw backend/runtime JSON in the child-facing game UI.
- Keep AI companion behavior scripted until a separate child-safety review exists.

## Battle Safety Rules

- The typed answer may decide only success or failure.
- The typed answer must never decide unlimited damage, healing, block, or mana.
- Damage, heal, block, and mana gain values must come from JSON/config.
- Respect caps such as `fixedValue`, `amount`, `maxAmount`, or `cap`.
- Keep enemy/player HP and mana clamped to safe ranges.

## Required Artifacts

- `templates/feature_list.json`: feature state and required evidence
- `templates/progress.md`: session log and current verified status
- `templates/init.sh`: standard startup and verification path
- `templates/session_handoff.md`: compact handoff for larger sessions
- `templates/quality-document.md`: codebase health snapshot

## Definition Of Done

A feature is done only when all of the following are true:

- the requested behavior is implemented
- required verification actually ran
- evidence is recorded in `templates/feature_list.json` or `templates/progress.md`
- the repository remains restartable from the standard startup path
- child-facing safety and battle safety rules are preserved

## End Of Session

Before ending a session:

1. Update `templates/progress.md` if the verified state changed.
2. Update `templates/feature_list.json` if feature status changed.
3. Record unresolved risks or blockers.
4. Run the relevant verification command.
5. Commit only when the work is in a safe state and the user asks for or expects a commit.
