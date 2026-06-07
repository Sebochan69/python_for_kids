# Smoke Test

Use this checklist after pulling the latest `main`.

## 1. Install Dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
```

In PowerShell, activate with:

```powershell
.\.venv\Scripts\Activate.ps1
```

## 2. Start Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

Expected: Uvicorn starts without errors.

Health check:

```bash
curl http://127.0.0.1:8001/health
```

Expected:

```json
{"status":"ok","service":"python-for-kids-backend"}
```

## 3. Start Frontend

In a second terminal:

```bash
cd frontend
VITE_API_BASE_URL=http://127.0.0.1:8001 npm run dev -- --host 127.0.0.1 --port 5173
```

Expected: Vite shows a local URL. Open it in the browser.

## 4. Check Main Flow

1. Confirm the app shows `Python for Kids`.
2. Confirm Sebot opens with a greeting.
3. Confirm header navigation shows `Quest 1 of 14`, Previous, Quest List, and Next.
4. Click `Quest List`.
5. Confirm the grouped popover appears and does not push the page layout down.
6. Click outside the popover.
7. Confirm the Quest List closes.
8. Open Quest List again and choose `Change a Score`.
9. Confirm the code editor updates to:

   ```python
   score = 1
   score = score + 1
   print(score)
   ```

10. Click `Run Quest`.
11. Confirm `Python Printed` shows `2`.
12. Confirm `Adventure Log` shows story cards.
13. Hover a story card with a code line.
14. Confirm the matching code line highlights temporarily.
15. Click a story card.
16. Confirm the selected story card stays highlighted.
17. Click `Explain Step`.
18. Confirm Sebot explains the selected step.
19. Click `Hint Please`.
20. Confirm Sebot gives local guidance.
21. Confirm Mission Check shows `Mission complete`.
22. Confirm `Next Quest` appears after mission completion.

## 5. Check Checkpoint Flow

1. Open Quest List.
2. Choose `Checkpoint: Number Adventure`.
3. Click `Run Quest`.
4. Confirm the quest completes and prints:

   ```text
   3
   ```

5. Confirm the checkpoint uses only concepts introduced earlier.

## 6. Check Error Flow

Change the code to:

```python
score = 1 / 0
print(score)
```

Click `Run Quest`.

Expected:

- The app does not crash.
- `Python got stuck` appears in the story.
- Mission Check is not complete.
- Sebot can still give a hint.

## 7. Check Safety Boundaries

Change the code to:

```python
import os
print("hi")
```

Click `Run Quest`.

Expected: importing modules is blocked with a gentle error.

## 8. Build Checks

Frontend:

```bash
cd frontend
npm run build
```

Backend syntax/import check:

```bash
cd backend
python -B -c "from pathlib import Path; import ast; [ast.parse(p.read_text(encoding='utf-8'), filename=str(p)) for p in Path('app').rglob('*.py')]; from app.main import app; print(app.title)"
```

Expected: both checks pass.

## Troubleshooting

- If port `8001` is busy, start the backend on another port and update
  `VITE_API_BASE_URL`.
- If port `5173` is busy, Vite may suggest another port.
- If the frontend cannot run code, confirm the backend is running and CORS uses
  the same local frontend URL.
- This runtime is a prototype learning guardrail, not a production sandbox.
