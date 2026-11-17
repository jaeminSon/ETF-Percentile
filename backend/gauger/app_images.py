"""Images shown on the app's explain screen, served at /image/<name>.png.

Regenerated daily by update_data.sh:  python -m gauger.app_images
"""

import os

import numpy as np
import matplotlib.pyplot as plt

from .plot import plot_mean_std, plot_return_with_ma
from .stats import density_function, divide_by_rolling_ma
from .yahoo_finance import download_histories

savedir = os.path.abspath(os.path.join(os.path.dirname(__file__), "image"))


def leverage_return_chart(start_date: str, window: int = 100) -> None:
    """return_leverage.png: cumulative return of SPXL, SOXL, TQQQ with their MA."""
    plot_return_with_ma(
        ["SPXL", "SOXL", "TQQQ"],
        start_date,
        window=window,
        path_savefile=os.path.join(savedir, "return_leverage.png"),
        title="Return and Volume of SPXL, TQQQ, SOXL",
        figsize=(10, 9),
        linewidth=1,
        as_return=True,
    )


def price_ratio_chart(start_date: str, ticker: str = "SOXL", window: int = 100) -> None:
    """div_by_ma_<ticker>.png: price / MA with its rolling mean and +-1/2 std bands."""
    price = download_histories([ticker])[ticker]["price"]
    price = price[price.index >= start_date]
    p_ratio = divide_by_rolling_ma(price, window)
    df_p_ratio = p_ratio.to_frame(name=ticker)
    df_p_ratio["mean"] = p_ratio.rolling(window=window).mean()
    plot_mean_std(
        df_p_ratio,
        ticker,
        width_plot=1.1,
        path_savefile=os.path.join(savedir, f"div_by_ma_{ticker}.png"),
        title=f"(Closing Price) / ({window}-day MA) of {ticker}",
    )


def price_ratio_pdf(start_date: str, ticker: str = "SOXL", window: int = 100) -> None:
    """pdf_<ticker>.png: distribution of price / MA with today's value marked."""

    def nearest_index(axis, value):
        return min(range(len(axis)), key=lambda i: abs(axis[i] - value))

    price = download_histories([ticker])[ticker]["price"]
    price = price[price.index >= start_date]
    series = divide_by_rolling_ma(price, window)
    p = density_function(list(series))
    x = np.linspace(0, 2, 1000)
    y = [p(i)[0] for i in x]
    x = [x[i] for i in range(len(x)) if y[i] > 0.01]
    y = [y[i] for i in range(len(y)) if y[i] > 0.01]
    index_curr = nearest_index(x, series.iloc[-1])
    x_curr = x[index_curr]
    y_curr = y[index_curr]

    plt.close()
    fig, ax = plt.subplots(figsize=(10, 8))
    ax.hist(series, bins=100, color="orange", density=True)
    ax.plot(x, y, color="red", linewidth=1)
    ax.scatter([x_curr], [y_curr], color="blue", marker="v", s=100)
    ax.plot([x_curr, x_curr], [y_curr, 0], linestyle="--", color="red", linewidth=1)
    ax.set_title(f"Distribution of {ticker}'s (Closing Price) / ({window}-day MA)")
    ax.set_xlabel(f"(Closing Price) / ({window}-day MA)")
    plt.savefig(os.path.join(savedir, f"pdf_{ticker}.png"))


if __name__ == "__main__":
    os.makedirs(savedir, exist_ok=True)
    leverage_return_chart("1990-01-01")
    price_ratio_chart("1990-01-01")
    price_ratio_pdf("1990-01-01")
