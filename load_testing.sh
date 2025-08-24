# initial query
# ab -n 5000 -c 100 "https://jaemin-lab.ddns.net/api//percentile?ticker=META&window=100"

# bulk query
ab -n 500 -c 100 "https://jaemin-lab.ddns.net/api/page=category=index"
ab -n 500 -c 100 "https://jaemin-lab.ddns.net/api/page=category=tech"
ab -n 500 -c 100 "https://jaemin-lab.ddns.net/api/page=category=asset"
ab -n 500 -c 100 "https://jaemin-lab.ddns.net/api/page=category=global"
ab -n 500 -c 100 "https://jaemin-lab.ddns.net/api/page=category=sector"