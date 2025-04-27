#!/bin/bash
NUM_CPUS=$(nproc)
NUM_WORKERS=$((2 * NUM_CPUS + 1))

exec gunicorn --workers $NUM_WORKERS --bind 0.0.0.0:8080 wsgi:app
