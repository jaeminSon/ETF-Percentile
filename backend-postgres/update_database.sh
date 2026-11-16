# update daily
while ! curl -X POST -s -o /dev/null -w "%{http_code}" localhost:8000/update-database | grep -q "200"; do 
   echo "Request failed, retrying in 1 second..."; sleep 1; 
done

# compute percentile for caching
for t in SPY SPXL QQQ TQQQ IWM TNA DIA DDM DX-Y.NYB EURUSD=X JPYUSD=X TLT TMF GLD SLV BTC-USD BITX ETH-USD XLF FAS AAPL AAPU AMZN AMZU COIN CONL META FBL GOOGL GGLL MSFT MSFU NVDA NVDL TSLA TSLL SMH SOXL SOXX FEZ FXI IEMG EWA EWZ EWC EWG EWH EPI EWI EWJ EWM EWW IDX EWS EZA EWY EWP EWL EWT EWU ^SP500-25 ^SP500-30 ^SP500-55 ^SP500-35 ^GSPE ^SP500-40 ^SP500-20 ^SP500-15 ^SP500-60 ^SP500-45; do
   for w in 20 50 100 200; do
	curl "localhost:8000/percentile?ticker=${t}&window=${w}"
   done
done

cd /Users/sonjaemin/ETF-Percentile/backend
/Library/Frameworks/Python.framework/Versions/3.11/bin/python3.11 -m gauger.plot
