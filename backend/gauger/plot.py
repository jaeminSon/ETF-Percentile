import os
from typing import List

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import scipy

from .yahoo_finance import download, yf_return

savedir = os.path.abspath(os.path.join(os.path.dirname(__file__), "image"))


def divide_by_rolling_ma(series: pd.Series, window: int) -> pd.Series:
    return (series / series.rolling(window=window).mean()).dropna()


def density_function(x: List[float]):
    return scipy.stats.gaussian_kde(x)


def plot_return_with_ma(
    start_date: str,
    window: int = 100,
    tickers: List[str] = ["SPXL", "SOXL", "TQQQ"],
) -> None:
    df = download(tickers, start_date, end_date=None)
    df_return = yf_return(df)
    df_ma = df_return.rolling(window=window).mean().dropna()
    df_return = df_return.loc[df_ma.index]
    df_volume = df["Volume"].loc[df_ma.index]

    tickers = df_return.columns

    plt.close()
    fig, (ax1, ax2) = plt.subplots(
        2, 1, gridspec_kw={"height_ratios": [5, 1]}, figsize=(10, 9)
    )

    colors = [
        "orange",
        "purple",
        "brown",
        "blue",
        "red",
        "green",
        "pink",
        "gray",
        "olive",
        "cyan",
    ]
    t2c = {tickers[i]: colors[i] for i in range(len(tickers))}

    for ticker in tickers:
        ax1.plot(
            df_return[ticker].index,
            list(df_return[ticker]),
            label=ticker,
            color=t2c[ticker],
            linewidth=1,
        )

    for ticker in tickers:
        ax1.plot(
            df_ma[ticker].index, list(df_ma[ticker]), color=t2c[ticker], linewidth=1
        )

        peaks = scipy.signal.find_peaks(df_ma[ticker], width=1, rel_height=0.01)[0]
        bottomes = scipy.signal.find_peaks(-df_ma[ticker], width=1, rel_height=0.01)[0]
        ax1.scatter(
            [df_ma[ticker].index[p] for p in peaks],
            [df_ma[ticker].iloc[p] for p in peaks],
            color="r",
            marker="v",
            s=30,
        )
        ax1.scatter(
            [df_ma[ticker].index[p] for p in bottomes],
            [df_ma[ticker].iloc[p] for p in bottomes],
            color="b",
            marker="v",
            s=30,
        )
    ax1.set_ylabel("Return", color="red")
    ax1.legend()

    for ticker in tickers:
        ax2.plot(
            df_volume[ticker].index,
            list(df_volume[ticker]),
            label=ticker,
            color=t2c[ticker],
            linewidth=1,
        )
    ax2.set_xlabel("Date", color="black")
    ax2.set_ylabel("Volume", color="red")

    plt.tight_layout()
    plt.savefig(os.path.join(savedir, "return_leverage.png"))


def plot_mean_std(
    df: pd.DataFrame | List[pd.DataFrame],
    column_name: str | List[str],
    path_savefile: str,
    width_plot: float = 2,
):
    def add_std(df: pd.DataFrame):
        assert "mean" in df.columns
        std = np.std(df["mean"])
        df["+1s"] = df["mean"] + std
        df["+2s"] = df["mean"] + 2 * std
        df["-1s"] = df["mean"] - std
        df["-2s"] = df["mean"] - 2 * std
        return df.dropna()

    def config_plots(column_name: str, width_plot: float):
        return {
            "color": {
                column_name: "blue",
                "mean": "yellow",
                "+1s": "orange",
                "+2s": "red",
                "-1s": "green",
                "-2s": "lime",
            },
            "style": {
                column_name: "-",
                "mean": "--",
                "+1s": "--",
                "+2s": "--",
                "-1s": "--",
                "-2s": "--",
            },
            "linewidth": {
                column_name: width_plot,
                "mean": 1,
                "+1s": 1,
                "+2s": 1,
                "-1s": 1,
                "-2s": 1,
            },
        }

    if isinstance(df, pd.DataFrame):
        df = add_std(df)
        plt.close()
        fig, ax = plt.subplots(figsize=(16, 8))
        plot_kwargs = config_plots(column_name, width_plot)
        for column in df.columns:
            df[column].plot(
                ax=ax,
                label=column,
                **{k: plot_kwargs[k][column] for k in plot_kwargs},
            )
        plt.legend(loc="best")
        plt.savefig(path_savefile)
    elif isinstance(df, list) and isinstance(column_name, list):
        assert len(df) == len(column_name) == 2, "Currently Price and Volume only."
        plt.close()
        fig, axes = plt.subplots(
            2, 1, gridspec_kw={"height_ratios": [5, 1]}, figsize=(20, 18)
        )
        for i in range(2):
            df_std_added = add_std(df[i])
            plot_kwargs = config_plots(column_name[i], width_plot)
            for column in df_std_added.columns:
                df_std_added[column].plot(
                    ax=axes[i],
                    label=column,
                    **{k: plot_kwargs[k][column] for k in plot_kwargs},
                )
            axes[i].legend(loc="best")
        plt.tight_layout()
        plt.savefig(path_savefile)


def plot_series(
    start_date: str,
    end_date: str = None,
    window: int = 100,
    tickers: List[str] = ["SOXL"],
) -> None:
    df = download(tickers, start_date, end_date)
    tickers = df["Volume"].columns

    for ticker in tickers:
        p_ratio = divide_by_rolling_ma(df["Close"][ticker], window)
        df_p_ratio = p_ratio.to_frame(name=ticker)
        df_p_ratio["mean"] = p_ratio.rolling(window=window).mean()
        plot_mean_std(
            df_p_ratio,
            ticker,
            width_plot=1.1,
            path_savefile=os.path.join(savedir, f"div_by_ma_{ticker}.png"),
        )


def plot_pdf(
    start_date: str,
    end_date: str = None,
    window: int = 100,
    tickers: List[str] = ["SOXL"],
):
    def nearest_index(axis, value):
        return min(range(len(axis)), key=lambda i: abs(axis[i] - value))

    df = download(tickers, start_date, end_date)
    tickers = df["Close"].columns

    plt.close()
    fig, ax = plt.subplots(figsize=(10, 8))

    for ticker in tickers:
        series = divide_by_rolling_ma(df["Close"][ticker], window)
        p = density_function(list(series))
        x = np.linspace(0, 2, 1000)
        y = [p(i)[0] for i in x]
        x = [x[i] for i in range(len(x)) if y[i] > 0.01]
        y = [y[i] for i in range(len(y)) if y[i] > 0.01]
        index_curr = nearest_index(x, series.iloc[-1])
        x_curr = x[index_curr]
        y_curr = y[index_curr]

        ax.hist(series, bins=100, color="orange", density=True)
        ax.plot(x, y, color="red", linewidth=1)
        ax.scatter(
            [x_curr],
            [y_curr],
            color="blue",
            marker="v",
            s=100,
        )
        ax.plot(
            [x_curr, x_curr],
            [y_curr, 0],
            linestyle="--",
            color="red",
            linewidth=1,
        )
        ax.set_title(f"Price divdeded by {window}MA for {ticker}")
        ax.set_xlabel(f"Price / {window}MA")

        plt.savefig(os.path.join(savedir, f"pdf_{ticker}.png"))


if __name__ == "__main__":
    plot_return_with_ma("1990-01-01")
    plot_series("1990-01-01")
    plot_pdf("1990-01-01")
