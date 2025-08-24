# initial query
# ab -n 5000 -c 100 "https://jaemin-lab.ddns.net/api//percentile?ticker=META&window=100"

# bulk query
ab -n 1000 -c 100 "https://jaemin-lab.ddns.net/api/page=category=index"