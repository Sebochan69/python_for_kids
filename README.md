# Python for Kids

Python for Kids is a V1 kid-friendly Python learning app for children ages
8-10. Learners write small Python programs, run them, see what Python printed,
and read simple story-style steps that explain what happened.

The project borrows lessons learned from PROJECT OOH-AHH, but it is a separate
product with a simpler UI, safer learning boundaries, and child-first language.

## V1 Scope

V1 is officially focused on classroom-ready Python foundations:

- one-file editable Python missions
- controlled FastAPI runtime endpoint for tiny snippets
- stdout, stderr, error, timeout, and event capture
- story cards for memory boxes, changes, printed output, errors, start, and finish
- code-line highlighting from story cards
- expected-output and required-concept validation
- grouped Quest List navigation with previous/next flow
- 14-quest lesson pack with 3 checkpoints
- Sebot, a local deterministic guide for explanations and hints
- safety and accessibility notes for child-facing use

## Lesson Pack

The V1 quest order is:

1. Say Hello
2. Remember a Name
3. Words and Numbers
4. Add Numbers
5. Join Words
6. Change a Score
7. Compare Scores
8. Choose a Game
9. Repeat a Cheer
10. List of Friends
11. Function Machine
12. Checkpoint: First Words
13. Checkpoint: Number Adventure
14. Checkpoint: Mini Party

The checkpoints mix only concepts introduced earlier in the path.

## Non-Goals For V1

- no free-form child AI chat
- no accounts or progress persistence
- no public sharing
- no real package installation
- no Docker or Kubernetes
- no multi-file projects
- no multi-language support
- no adult developer debug UI
- no raw runtime JSON in child-facing views

## Safety Principles

- Do not ask children for personal information.
- Do not expose filesystem or network behavior to learner code.
- Do not include external links in child-facing responses.
- Do not generate full solutions automatically.
- Prefer encouragement and curiosity over scoring pressure.
- Add parent/teacher controls before accounts, sharing, or persistence.

## Project Structure

```text
frontend/   # kid-friendly React app
backend/    # FastAPI backend
lessons/    # JSON quest definitions
docs/       # product, safety, demo, and release notes
shared/     # shared lesson schema
```

The lesson pack is in [lessons](lessons), and the lesson contract is in
[lesson.schema.json](shared/schemas/lesson.schema.json).

## Run Frontend

```bash
cd frontend
npm install
VITE_API_BASE_URL=http://127.0.0.1:8001 npm run dev
```

Open the Vite URL shown in the terminal.

## Run Backend

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

In PowerShell, activate with:

```powershell
.\.venv\Scripts\Activate.ps1
```

Health check:

```bash
curl http://127.0.0.1:8001/health
```

Run a tiny Python snippet:

```bash
curl -X POST http://127.0.0.1:8001/api/v1/run \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"hello\")","file_name":"main.py"}'
```

The run response includes kid-facing runtime events. See
[Runtime Events](docs/runtime-events.md).

## Docs

- [Product Definition](docs/product-definition.md)
- [Safety Notes](docs/safety.md)
- [Accessibility Notes](docs/accessibility.md)
- [Smoke Test](docs/smoke-test.md)
- [Demo Flow](docs/demo-flow.md)
- [V1 Release Notes](docs/release-notes-v1.md)

## V1 Release Checklist

- Frontend build passes with `npm run build`.
- Backend imports cleanly and exposes `/health`.
- `/api/v1/run` handles simple output, runtime errors, blocked imports, and timeouts.
- Quest List, Previous, and Next navigation work.
- Story cards stay synced with code-line highlighting.
- Sebot opens with the V1 greeting and provides local hints/explanations.
- Lesson validation works for expected output and required concepts.
- Known limitations are documented in release notes.
