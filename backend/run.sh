#!/bin/bash
cd "$(dirname "$0")" || exit 1

# First start (e.g. fresh container): download the data before serving.
if ! ls data/*.json >/dev/null 2>&1; then
    python -m gauger.update
fi

NUM_CPUS=$(nproc 2>/dev/null || sysctl -n hw.ncpu)
NUM_WORKERS=$((2 * NUM_CPUS + 1))

exec gunicorn --workers $NUM_WORKERS --bind 0.0.0.0:8080 wsgi:app
