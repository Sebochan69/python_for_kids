# V1 Release Notes

Python for Kids V1 is a demo-ready prototype for children ages 8-10 learning
their first Python ideas through tiny missions, runtime story cards, and gentle
feedback.

## Included

- Kid-friendly React workspace with a mission picker, starter code, Run Mission
  button, story cards, output panel, and helper panel.
- FastAPI backend with `/health` and controlled one-file Python execution at
  `/api/v1/run`.
- Prototype safety guardrails for imports, `input()`, long-running code, and
  common unsafe builtins.
- Runtime events for starting, line execution, remembering values, changing
  values, printing, errors, and finishing.
- Code Map highlighting that connects story cards to related code lines.
- Starter mission pack covering `print()`, variables, updates, loops,
  conditions, and functions.
- Gentle expected-output validation and simple concept badges.
- Local deterministic hints and explanations. No free-form child AI chat is
  included.
- Smoke-test and demo-flow documentation.

## Verification

Release prep checked:

- `frontend`: `npm run build`
- `backend`: AST/import check for `app`
- live backend `/health`
- live backend `/api/v1/run` with `print("hello")`

The documented smoke test and demo flow are the source of truth for manual
release verification.

## Known Limitations

- The runtime is a prototype learning guardrail, not a production sandbox.
- Learner code is limited to tiny one-file Python snippets.
- Imports, package installation, filesystem persistence, network access, and
  interactive input are blocked or unavailable.
- There are no accounts, progress persistence, public sharing, or teacher
  dashboards yet.
- Story cards explain a small set of beginner Python patterns and are not a
  complete Python debugger.
- Helper responses are local and deterministic; there is no external AI
  integration in V1.

## Next Direction

Likely next work includes more missions, a more guided editor for younger
learners, teacher/parent controls, richer loop/function storytelling, and
continued accessibility and reading-level improvements.
