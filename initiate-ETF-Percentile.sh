#!/bin/bash

# caddy
osascript -e 'tell application "Terminal" to do script "sudo caddy run --config /Users/sonjaemin/ETF-Percentile/Caddyfile --adapter caddyfile"' 

# nginx (sudo nginx -s quit)
osascript -e 'tell application "Terminal" to do script "sudo nginx -c /Users/sonjaemin/ETF-Percentile/nginx.conf"' 

# backend - serving
osascript -e 'tell application "Terminal" to do script "cd /Users/sonjaemin/ETF-Percentile/backend; gunicorn -w 1 -t 3600 -b 0.0.0.0:8000 wsgi:app;"'

# frontend
# osascript -e 'tell application "Terminal" to do script "cd /Users/sonjaemin/ETF-Percentile/frontend; npx expo start;"'
