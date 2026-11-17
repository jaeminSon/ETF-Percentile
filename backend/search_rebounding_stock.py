"""Daily screen for rebounding / undervalued stocks in the S&P 500 and selected ETFs.

    cd backend && .venv/bin/python search_rebounding_stock.py

Writes to search_for_undervalued_stocks/<YYYYMMDD>/:
    etf_rebound.json, sp500_rebound.json      tickers whose MA downtrend is slowing on high volume
    <ticker>.png                              price/MA/volume chart for each of those tickers
    etf_valuation.json, sp500_valuation.json  price/MA percentiles (100, 200 days) per ticker
    rank.json                                 all tickers by score -(p100 + p200), highest percentiles first
"""

import os
import sys
from datetime import datetime

os.environ.setdefault("MPLBACKEND", "Agg")  # save charts without opening windows

from gauger import compute_valuation, plot_chart, rebound_stocks, sort_valuation
from gauger.yahoo_finance import TICKERS_DIR, refresh_sp500_list

HOME = os.path.dirname(os.path.abspath(__file__))


def main() -> int:
    date = datetime.today().strftime("%Y%m%d")
    dir_save = os.path.join(HOME, "search_for_undervalued_stocks", date)
    os.makedirs(dir_save, exist_ok=True)

    # S&P 500 membership changes: refresh from Wikipedia (keeps the old list on failure).
    lists = {"sp500": refresh_sp500_list()}
    etf_list = os.path.join(TICKERS_DIR, "selected_etfs.json")
    if os.path.exists(etf_list):
        lists["etf"] = etf_list
    else:
        print(f"Skipping ETFs: {etf_list} not found")

    valuations = []
    for name, path in lists.items():
        rebound_json = os.path.join(dir_save, f"{name}_rebound.json")
        rebound_stocks(path, rebound_json)
        plot_chart(rebound_json, dir_save)

        valuation_json = os.path.join(dir_save, f"{name}_valuation.json")
        compute_valuation(path, valuation_json)
        valuations.append(valuation_json)

    sort_valuation(valuations, path_save=os.path.join(dir_save, "rank.json"))
    print(f"Saved results to {dir_save}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
