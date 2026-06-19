#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

FRONTEND_INSTALL_CMD=(npm install)
FRONTEND_VERIFY_CMD=(npm run build)
FRONTEND_START_CMD=(npm run dev -- --host 127.0.0.1 --port 5173)

BACKEND_INSTALL_CMD=(python -m pip install -r requirements.txt)
BACKEND_VERIFY_CMD=(python -m compileall app)
BACKEND_START_CMD=(python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001)

run_in() {
  local dir="$1"
  shift

  echo "==> ($dir) $*"
  (
    cd "$dir"
    "$@"
  )
}

print_command() {
  printf '    '
  printf '%q ' "$@"
  printf '\n'
}

echo "==> Working directory: $PWD"

echo "==> Syncing frontend dependencies"
run_in frontend "${FRONTEND_INSTALL_CMD[@]}"

if [ "${SKIP_BACKEND_INSTALL:-0}" != "1" ]; then
  echo "==> Syncing backend dependencies"
  run_in backend "${BACKEND_INSTALL_CMD[@]}"
else
  echo "==> Skipping backend dependency sync because SKIP_BACKEND_INSTALL=1"
fi

echo "==> Running frontend verification"
run_in frontend "${FRONTEND_VERIFY_CMD[@]}"

echo "==> Running backend verification"
run_in backend "${BACKEND_VERIFY_CMD[@]}"

echo "==> Startup commands"
echo "Frontend:"
print_command cd frontend "&&" "${FRONTEND_START_CMD[@]}"
echo "Backend:"
print_command cd backend "&&" "${BACKEND_START_CMD[@]}"

if [ "${RUN_FRONTEND:-0}" = "1" ]; then
  echo "==> Starting frontend"
  run_in frontend "${FRONTEND_START_CMD[@]}"
fi

echo "Set RUN_FRONTEND=1 if you want init.sh to launch the frontend after verification."
