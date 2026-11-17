#!/bin/bash
# Starts everything the backend needs, each in its own Terminal window.
# Daily data refresh is done by cron via backend/update_data.sh (see README).

DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$DIR/backend"

# python environment for the backend (one-time)
if [ ! -x "$BACKEND/.venv/bin/gunicorn" ]; then
    (cd "$BACKEND" && uv venv -p 3.11 .venv && uv pip install -p .venv/bin/python -r requirements.txt) || exit 1
fi

# first run on this machine: download all data before serving
if ! ls "$BACKEND"/data/*.json >/dev/null 2>&1; then
    "$BACKEND/update_data.sh"
fi

# backend - serving (only reachable through Caddy)
osascript -e "tell application \"Terminal\" to do script \"cd $BACKEND; .venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 wsgi:app\""

# caddy: HTTPS on 80/443, /api/* -> gunicorn (macOS lets normal users bind 80/443, no sudo needed)
CADDY="$(command -v caddy || echo "$HOME/.local/bin/caddy")"
osascript -e "tell application \"Terminal\" to do script \"cd $DIR; $CADDY run --config $DIR/Caddyfile --adapter caddyfile\""

# frontend
# osascript -e "tell application \"Terminal\" to do script \"cd $DIR/frontend; npx expo start\""
