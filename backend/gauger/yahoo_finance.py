from typing import Optional, Tuple
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import yfinance as yf


ALL_TICKERS = [
    "SPY",
    "SPXL",
    "QQQ",
    "TQQQ",
    "SOXX",
    "SOXL",
    "TSLA",
    "TSLL",
    "NVDA",
    "NVDL",
    "GLD",
    "TLT",
    "CONL",
]


def all_tickers():
    return ALL_TICKERS


def download_all(start_date: str, end_date: Optional[str] = None) -> pd.DataFrame:
    if end_date is None:
        start_date, end_date = period(start_date)
    return download(ALL_TICKERS, start_date, end_date), ALL_TICKERS


def download(symbol, start_date, end_date) -> pd.DataFrame:
    return yf.download(symbol, start=start_date, end=end_date, auto_adjust=True)


def period(start_date: Optional[str] = None, date_back: int = None) -> Tuple[str, str]:
    assert not (
        start_date and date_back
    ), "Both start_date and date_back cannot be set at the same time."
    if date_back:
        now = datetime.now()
        start_date = (now - timedelta(days=date_back)).strftime("%Y-%m-%d")
        end_date = now.strftime("%Y-%m-%d")
        return start_date, end_date
    elif start_date:
        try:
            datetime.strptime(start_date, "%Y-%m-%d")
        except Exception:
            raise ValueError(
                f"Failed to process {start_date}. start_date should be YYYY-MM-DD format."
            )
        end_date = datetime.now().strftime("%Y-%m-%d")
        return start_date, end_date


def percent_change(yf_df: pd.DataFrame, key="Close", periods=1) -> pd.DataFrame:
    return (
        yf_df[key]
        .rolling(window=periods)
        .mean()
        .dropna()
        .pct_change(periods=periods)
        .fillna(0)
        .dropna(axis=1, how="all")
        .dropna(axis=0)
    )


def yf_return(yf_df: pd.DataFrame, key="Close") -> pd.DataFrame:
    pct_ch = percent_change(yf_df, key)
    return (pct_ch + 1).cumprod() - 1


def expected_return_from_pct_ch(pct_ch: pd.DataFrame) -> np.ndarray:
    return np.array(pct_ch).mean(axis=0)
