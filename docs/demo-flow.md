# Demo Flow

This flow presents the current Python for Kids prototype in about five minutes.

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
- runtime story cards
- code line highlighting
- mission validation
- skill badges
- local helper hints

## Presenter Steps

1. Show the mission picker.

   Say: "Each mission teaches one small Python idea."

2. Choose `Change a Score`.

   Expected: the mission card and starter code update.

3. Point at the starter code:

   ```python
   score = 1
   score = score + 1
   print(score)
   ```

   Say: "Python remembers a score, changes it, then says it."

4. Click `Run Mission`.

   Expected: `Python Says` shows `2`.

5. Show the story cards.

   Expected examples:

   - Python remembers `score`
   - Python changes `score`
   - Python says something

6. Hover or keyboard-focus a story card.

   Expected: the matching line lights up in the Code Map.

7. Show Mission Check.

   Expected: `Mission complete`, expected output, actual output, and earned
   badges.

8. Click `Explain Step`.

   Expected: local deterministic explanation appears. No AI chat is used.

9. Click `Hint Please`.

   Expected: local deterministic hint appears.

10. Click `Next Mission`.

    Expected: the next mission loads.

## Quick Wrong Answer Demo

Change the code to:

```python
score = 1
print(score)
```

Run again.

Expected:

- Python says `1`.
- Mission Check shows `Almost there` or `Try again`.
- Skill badges help show which concepts were used or are still waiting.

## Current Boundaries To Say Out Loud

- This is a prototype for ages 8-10.
- It runs tiny one-file Python missions only.
- Imports, input, package installs, filesystem persistence, and network access
  are blocked or not available.
- The helper is local and deterministic, not free-form AI chat.
- There are no accounts, progress tracking, or public sharing yet.
