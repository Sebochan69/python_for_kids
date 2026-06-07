# Demo Flow

This flow presents Python for Kids V1 in about five minutes.

## Setup

Start the backend:

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

Start the frontend:

```bash
cd frontend
VITE_API_BASE_URL=http://127.0.0.1:8001 npm run dev -- --host 127.0.0.1 --port 5173
```

Open the Vite URL.

## Recommended Demo Lesson

Use `Change a Score`.

It demonstrates:

- memory box creation
- memory box update
- printed output
- Adventure Log story cards
- code-line highlighting
- mission validation
- Sebot explanations and hints

## Presenter Steps

1. Show the header.

   Say: "This is Python for Kids V1. Students move through quests, but they can
   open Quest List if they need to review an older lesson."

2. Open `Quest List`, then choose `Change a Score`.

   Expected: the popover opens without moving the whole layout, and the mission
   card plus starter code update.

3. Point at the starter code:

   ```python
   score = 1
   score = score + 1
   print(score)
   ```

   Say: "Python remembers a score, changes it, then prints it."

4. Click `Run Quest`.

   Expected: `Python Printed` shows `2`.

5. Show the Adventure Log.

   Expected examples:

   - Python starts the quest.
   - Python remembers `score`.
   - Python changes `score`.
   - Python prints something.

6. Hover a story card.

   Expected: the matching code line lights temporarily.

7. Click a story card.

   Expected: the story card stays selected, and its code line remains visible.

8. Click `Explain Step`.

   Expected: Sebot gives a local deterministic explanation for the selected
   step. No AI chat is used.

9. Click `Hint Please`.

   Expected: Sebot gives local deterministic guidance.

10. Show Mission Check.

    Expected: `Mission complete`, expected output, and actual output are visible.

11. Click `Next Quest`.

    Expected: the next quest loads.

## Checkpoint Demo Option

Use `Checkpoint: Number Adventure`.

Say: "Checkpoints mix ideas students have already learned. They can use Quest
List to jump back to earlier lessons if they need a review."

Expected: the checkpoint uses variables, updates, comparison, `if`, and
`print()` without introducing a brand-new concept.

## Quick Wrong Answer Demo

Change the `Change a Score` code to:

```python
score = 1
print(score)
```

Run again.

Expected:

- `Python Printed` shows `1`.
- Mission Check shows `Almost there` or `Try again`.
- Sebot can give a gentle hint.

## Current Boundaries To Say Out Loud

- This is V1 for ages 8-10.
- It runs tiny one-file Python quests only.
- Imports, input, package installs, filesystem persistence, and network access
  are blocked or unavailable.
- Sebot is local and deterministic, not free-form AI chat.
- There are no accounts, progress tracking, public sharing, or teacher
  dashboards yet.
