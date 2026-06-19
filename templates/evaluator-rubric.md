# Evaluator Rubric

Use this rubric after implementation and before final acceptance. It is tuned
for the Python Wizard RPG POC and Harness Engineering handoff quality.

Scoring:

- 0: missing or unsafe
- 1: partially acceptable, gaps remain
- 2: acceptable with evidence

| Category | Question | Score (0-2) | Notes |
| --- | --- | --- | --- |
| Correctness | Does the implemented behavior match the selected feature and current POC flow? |  |  |
| Learning fit | Is the experience understandable, encouraging, and readable for kids ages 7-10? |  |  |
| Battle safety | Does user input decide only success/failure while configured JSON/engine values decide damage/heal/block/mana? |  |  |
| Verification | Did the required checks actually run, with evidence recorded? |  |  |
| Scope discipline | Did the session stay inside the chosen ticket/feature scope? |  |  |
| Reliability | Does the result survive refresh/restart without manual repair? |  |  |
| Maintainability | Are code, data, assets, and docs legible enough for the next session? |  |  |
| Handoff readiness | Can a fresh session continue from repo artifacts only? |  |  |

## Automatic Revise Conditions

Choose `Revise` even if the score looks high when any of these are true:

- Frontend/game code changed but `cd frontend && npm run build` was not run.
- Backend code changed but `cd backend && python -m compileall app` was not run.
- A battle challenge lacks `acceptedAnswers` or `hints`.
- User input can directly set damage, heal, block, or mana values.
- Child-facing UI asks for personal information.
- Free-form AI chat was added without explicit safety review.
- Visual overlap/readability issues are visible in the core battle loop.

## Verdict

- Accept
- Revise
- Block

## Required Follow-Up

- Missing evidence:
- Required fixes:
- Manual browser checks still needed:
- Next review trigger:
