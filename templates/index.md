# Harness Template Guide

These templates are adjusted for the current Python for Kids repository and the
Python Wizard RPG POC. They are meant to support Harness Engineering: reliable
agent sessions, explicit verification, safe handoff, and clear project state.

Use these files as the project-specific harness source. When ready, copy the
ones you want from `templates/` into the repo root or keep using them in place.

## Current Project Context

- Product: Python Wizard RPG POC
- Audience: kids ages 7-10
- Frontend: React 18, Vite, TypeScript, react-pageflip
- Backend: FastAPI with `/health` and `/api/v1/run`
- Lessons: JSON under `lessons/`
- Shared schemas: `shared/schemas/`
- Progress: `localStorage` only
- No auth, database, Phaser, or real AI companion integration yet

## Core Files

Copy or reference these first:

1. `AGENTS.md` or `codex.md`
2. `init.sh`
3. `progress.md`
4. `feature_list.json`

Add the remaining files as the project grows.

## AGENTS.md

Root instruction file for coding agents. It defines startup workflow, child
safety rules, battle safety rules, definition of done, and end-of-session
requirements.

Important project rules included:

- user input decides only success/failure
- damage/heal/block/mana values come from JSON/config
- no child-facing free-form AI without safety review
- no auth/database/server progress unless a ticket asks for it

## codex.md

Codex-focused operating instructions. It mirrors the same project rules but is
written as a compact session workflow.

Use it when you want a shorter agent instruction file for Codex sessions.

## init.sh

Standard startup and verification script for this repository.

It runs:

- `cd frontend && npm install`
- `cd backend && python -m pip install -r requirements.txt`
- `cd frontend && npm run build`
- `cd backend && python -m compileall app`

Options:

- `SKIP_BACKEND_INSTALL=1 ./templates/init.sh` skips backend dependency sync.
- `RUN_FRONTEND=1 ./templates/init.sh` starts the frontend after verification.

## progress.md

Current verified state and session log. New sessions should read this first.

Tracks:

- repo root
- startup commands
- verification commands
- current highest-priority unfinished feature
- blockers and known manual-test gaps

## feature_list.json

Machine-readable feature tracker for the RPG POC.

Current tracked areas include:

- Chapter 1 content and schema
- battle engine
- battle UI
- tutorial/spellbook/owl hint flow
- world map/local progress
- JRPG asset and animation polish
- optional future backend runtime integration

Status rules:

- `not_started`: has not begun
- `in_progress`: the one active feature
- `blocked`: cannot proceed until a documented blocker is resolved
- `passing`: verification passed and evidence is recorded

## session_handoff.md

Compact handoff note for long sessions. Use it when the next agent needs to
resume quickly without rereading every diff.

It records:

- what is verified now
- what changed this session
- what is broken or unverified
- next best action
- useful commands

## clean-state-checklist.md

End-of-session checklist. It is tuned for this repo and checks frontend build,
backend compile, JSON content safety, battle damage safety, child-facing safety,
asset handling, and handoff readiness.

## evaluator-rubric.md

Scorecard for reviewing an agent session.

It scores:

- correctness
- learning fit
- battle safety
- verification
- scope discipline
- reliability
- maintainability
- handoff readiness

It also includes automatic revise conditions for missing verification, unsafe
damage handling, missing hints/accepted answers, child data collection, and
visual overlap in the core battle loop.

## quality-document.md

Codebase health snapshot. It grades product domains and architecture layers so
humans and agents can see what is strong, risky, or still manually verified.

Current focus:

- battle UI/animations are still the riskiest area
- assets need naming consistency
- schema validation should eventually become a command in the harness
