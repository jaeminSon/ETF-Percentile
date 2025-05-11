# update daily
curl -X POST localhost:8000/update-database

# compute percentile for caching
for t in SPY SPXL QQQ TQQQ SOXX SOXL TSLA TSLL NVDA NVDL GLD TLT CONL; do
   for w in 20 50 100 200; do
	curl "localhost:8000/percentile?ticker=${t}&window=${w}"
   done
done

cd /Users/sonjaemin/ETF-Percentile/backend
/Library/Frameworks/Python.framework/Versions/3.11/bin/python3.11 -m gauger.plot
