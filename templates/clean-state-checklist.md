# Clean State Checklist

- [ ] `pwd` confirms the repo root is `python_for_kids`.
- [ ] Current progress is recorded in `templates/progress.md`.
- [ ] Feature state reflects what is actually passing versus unverified.
- [ ] Only one feature is marked `in_progress`.
- [ ] Frontend verification was run when frontend/game code changed: `cd frontend && npm run build`.
- [ ] Backend verification was run when backend code changed: `cd backend && python -m compileall app`.
- [ ] JSON lesson/schema changes were checked for obvious missing ids, hints, and accepted answers.
- [ ] Battle safety remains intact: user input decides success/failure only, never damage values.
- [ ] No child-facing AI, auth, database, or server persistence was added accidentally.
- [ ] No uploaded asset files were deleted or overwritten unintentionally.
- [ ] Known visual/manual-test gaps are recorded.
- [ ] The next session can continue without manual repair.
