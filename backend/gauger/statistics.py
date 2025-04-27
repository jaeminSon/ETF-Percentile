from typing import List

import pandas as pd

from .yahoo_finance import download, all_tickers


def divide_by_rolling_ma(
    series: pd.Series, window: int, return_rolling_ma=False
) -> pd.Series:
    if return_rolling_ma:
        rolling_ma = series.rolling(window=window).mean()
        return (series / rolling_ma).dropna(), rolling_ma
    else:
        return (series / series.rolling(window=window).mean()).dropna()


def merge_dataframes(list_dataframes):
    merged_df = list_dataframes[0]
    for d in list_dataframes[1:]:
        merged_df = pd.merge(
            merged_df, d, left_index=True, right_index=True, how="inner"
        )
    return merged_df


def stock_data(
    tickers: List[str],
    start_date: str,
    end_date: str = None,
    return_moving_average=False,
):
    df = download(tickers, start_date, end_date)
    df.dropna(inplace=True)

    data = {}
    for ticker in tickers:
        df_by_window = [
            df["Close"][ticker].to_frame("price"),
            df["Volume"][ticker].to_frame("volume"),
        ]
        if return_moving_average:
            for i, window in enumerate([20, 50, 100, 200]):
                price_ratio, price_ma = divide_by_rolling_ma(
                    df["Close"][ticker], window, True
                )
                price_ratio = price_ratio.to_frame(f"price_ratio_{window}ma")
                price_ma = price_ma.to_frame(f"price_{window}ma")

                merged_df = merge_dataframes([price_ratio, price_ma])
                df_by_window.append(merged_df)

        data[ticker] = merge_dataframes(df_by_window)

    return data


def all_stock_data(
    start_date: str,
    end_date: str = None,
    return_moving_average=True,
):
    tickers = all_tickers()
    return stock_data(tickers, start_date, end_date, return_moving_average)
