#!/bin/bash
# Daily update: download every ticker from Yahoo Finance into backend/data/*.json,
# then regenerate the explainer images. Run from cron after the US market closes, e.g.
#   0 10 * * * /path/to/ETF-Percentile/backend/update_data.sh >> /path/to/ETF-Percentile/backend/cron.log 2>&1
# The running server picks up the new files automatically (no restart needed).

cd "$(dirname "$0")" || exit 1
PYTHON="${PYTHON:-.venv/bin/python}"
# cron has no GUI session: draw plots without a window
export MPLBACKEND=Agg

echo "=== $(date '+%Y-%m-%d %H:%M:%S') update start"

"$PYTHON" -m gauger.update
status=$?

mkdir -p gauger/image
"$PYTHON" -m gauger.plot

exit $status
