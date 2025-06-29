# update daily
while ! curl -X POST -s -o /dev/null -w "%{http_code}" localhost:8000/update-database | grep -q "200"; do 
   echo "Request failed, retrying in 1 second..."; sleep 1; 
done

# compute percentile for caching
for t in SPY SPXL QQQ TQQQ IWM TNA DIA DDM TLT TMF IEF GLD SLV SMH SOXL BITX XLF FAS AAPL AAPU AMZN AMZU COIN CONL META FBL GOOGL GGLL MSFT MSFU NVDA NVDL TSLA TSLL; do
   for w in 20 50 100 200; do
	curl "localhost:8000/percentile?ticker=${t}&window=${w}"
   done
done


cd /Users/sonjaemin/ETF-Percentile/backend
/Library/Frameworks/Python.framework/Versions/3.11/bin/python3.11 -m gauger.plot
