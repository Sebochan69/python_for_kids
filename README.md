# Python for Kids

Python for Kids is a kid-friendly coding learning app for children under 10.
It helps learners write tiny Python programs, run them, and understand what
Python did through simple story-style steps.

The project borrows lessons learned from PROJECT OOH-AHH, but it is a separate
product with a simpler UI, safer learning boundaries, and child-first language.

## First Milestone

The first milestone focuses on ages 8-10 and teaches:

- `print()` as making Python say something
- variables as memory boxes
- updates as changing a memory box
- loops as repeaters
- conditions as questions
- functions as small machines

## Product Shape

The first app should include:

- mission picker
- friendly mission card
- one-file Python editor
- Run Mission button
- story-style runtime steps
- simple output panel
- gentle mission validation
- local hints only
- next mission flow

## Non-Goals For The First Milestone

- no free-form child AI chat
- no accounts or progress persistence
- no public sharing
- no real package installation
- no Docker or Kubernetes
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
lessons/    # mission definitions
docs/       # product, safety, demo, and architecture notes
shared/     # shared schemas when needed
```

The first lesson pack is in [lessons](lessons), and the lesson contract is in
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

## Current Status

This repository has project foundation docs plus a minimal Vite/FastAPI
skeleton. The backend can run one small Python snippet with prototype guardrails.
Runtime story cards, the mission picker, expected-output validation, simple
skill badges, and local helper hints are implemented.
