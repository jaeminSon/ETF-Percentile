"""gauger: price/MA percentiles for the app, plus research tools.

The API server only needs the light imports below. Research functions
(plots, finder, portfolio) are imported on first use so the server never
loads matplotlib/scipy.
"""

from importlib import import_module

from .yahoo_finance import all_tickers
from .store import WINDOWS, load_ticker

_LAZY = {
    # plot
    "plot_kelly": "plot",
    "plot_correlation": "plot",
    "plot_return_by_group": "plot",
    "plot_sort_by_return": "plot",
    "plot_sandp_divided_by_m2": "plot",
    "plot_sandp_divided_by_gdp": "plot",
    "plot_nasdaq_divided_by_m2": "plot",
    "plot_nasdaq_divided_by_gdp": "plot",
    "plot_SP500_JOLT": "plot",
    "plot_return_with_ma": "plot",
    "plot_pdf": "plot",
    "plot_series": "plot",
    "plot_closing_prices_for_tickers": "plot",
    "plot_chart": "plot",
    # portfolio
    "warnings": "portfolio",
    "bet_ratios_by_group": "portfolio",
    # finder
    "compute_valuation": "finder",
    "sort_valuation": "finder",
    "rebound_stocks": "finder",
}

__all__ = ["all_tickers", "load_ticker", "WINDOWS", *_LAZY]


def __getattr__(name):
    if name in _LAZY:
        return getattr(import_module(f".{_LAZY[name]}", __name__), name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
