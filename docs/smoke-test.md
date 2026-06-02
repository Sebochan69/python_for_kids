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
2. Use the mission picker and choose `Change a Score`.
3. Confirm the code editor updates to:

   ```python
   score = 1
   score = score + 1
   print(score)
   ```

4. Click `Run Mission`.
5. Confirm `Python Says` shows `2`.
6. Confirm `What Python Did` shows story cards.
7. Hover or focus story cards with code lines.
8. Confirm the matching line highlights in the Code Map.
9. Confirm Mission Check shows `Mission complete`.
10. Confirm skill badges show earned states.
11. Click `Explain Step` after selecting a story card.
12. Confirm the helper gives a local explanation.
13. Click `Hint Please`.
14. Confirm the helper gives local guidance.
15. Confirm `Next Mission` appears after mission completion.

## 5. Check Error Flow

Change the code to:

```python
score = 1 / 0
print(score)
```

Click `Run Mission`.

Expected:

- The app does not crash.
- `Python got stuck` appears in the story.
- Mission Check is not complete.
- The helper can still give a hint.

## 6. Check Safety Boundaries

Change the code to:

```python
import os
print("hi")
```

Click `Run Mission`.

Expected: importing modules is blocked with a gentle error.

## 7. Build Checks

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
- This runtime is a prototype, not a production sandbox.
