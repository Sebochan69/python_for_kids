# V1 Release Notes

Python for Kids V1 is the official first stable milestone for children ages
8-10 learning Python foundations through tiny quests, runtime story cards, and
gentle feedback.

## Included

- Kid-friendly React workspace with Quest navigation, mission card, Code Box,
  Python Printed output, Adventure Log, Mission Check, and Sebot.
- FastAPI backend with `/health` and controlled one-file Python execution at
  `/api/v1/run`.
- Prototype safety guardrails for imports, `input()`, long-running code, and
  common unsafe builtins.
- Runtime events for starting, line execution, remembering values, changing
  values, printing, errors, and finishing.
- Story cards that connect runtime events to child-facing explanations.
- Hover and click code-line highlighting from Adventure Log steps.
- Compact Quest List popover grouped into Start, Build, Think, Create, and
  Checkpoints.
- 14-quest Python foundations pack:
  - Say Hello
  - Remember a Name
  - Words and Numbers
  - Add Numbers
  - Join Words
  - Change a Score
  - Compare Scores
  - Choose a Game
  - Repeat a Cheer
  - List of Friends
  - Function Machine
  - Checkpoint: First Words
  - Checkpoint: Number Adventure
  - Checkpoint: Mini Party
- Gentle expected-output validation and required-concept checks.
- Sebot, a local deterministic guide for hints and explanations.
- Smoke-test and demo-flow documentation.

## Verification

Release prep should check:

- `frontend`: `npm run build`
- `backend`: AST/import check for `app`
- live backend `/health`
- live backend `/api/v1/run` with `print("hello")`
- manual smoke test in [Smoke Test](smoke-test.md)
- presenter flow in [Demo Flow](demo-flow.md)

## Known Limitations

- The runtime is a prototype learning guardrail, not a production sandbox.
- Learner code is limited to tiny one-file Python snippets.
- Imports, package installation, filesystem persistence, network access, and
  interactive input are blocked or unavailable.
- There are no accounts, progress persistence, public sharing, or teacher
  dashboards yet.
- Story cards explain a small set of beginner Python patterns and are not a
  complete Python debugger.
- Sebot responses are local and deterministic; there is no external AI
  integration in V1.
- Lesson validation uses simple pattern detection, not full semantic grading.

## Next Direction

Likely next work includes teacher-facing guidance, more guided editing for
younger learners, richer loop/function storytelling, safe progress persistence,
and continued accessibility and reading-level improvements.
