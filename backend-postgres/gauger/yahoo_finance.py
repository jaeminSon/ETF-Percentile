import json
import os
from typing import Optional, Tuple
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import yfinance as yf


def load_tickers_from_json(json_file_path: str) -> list:
    """Load ticker symbols from a JSON file.

    Args:
        json_file_path: Path to the JSON file containing ticker data

    Returns:
        List of ticker symbols (first element of each inner array)
    """
    try:
        with open(json_file_path, "r") as f:
            data = json.load(f)
        # Extract ticker symbols (first element of each inner array)
        tickers = [item[0] for item in data]
        return tickers
    except FileNotFoundError:
        print(f"Warning: {json_file_path} not found. Using empty list.")
        return []
    except Exception as e:
        print(f"Error reading {json_file_path}: {e}. Using empty list.")
        return []


def get_all_tickers() -> list:
    # Get the absolute path of the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))

    index_tickers = load_tickers_from_json(os.path.join(current_dir, "index.json"))
    tech_tickers = load_tickers_from_json(os.path.join(current_dir, "tech.json"))
    asset_tickers = load_tickers_from_json(os.path.join(current_dir, "asset.json"))
    country_tickers = load_tickers_from_json(os.path.join(current_dir, "country.json"))
    sectors_tickers = load_tickers_from_json(os.path.join(current_dir, "sectors.json"))

    # Combine and remove duplicates while preserving order
    all_tickers = []
    seen = set()

    for ticker in (
        index_tickers + asset_tickers + tech_tickers + country_tickers + sectors_tickers
    ):
        if ticker not in seen:
            all_tickers.append(ticker)
            seen.add(ticker)

    return all_tickers


# Load tickers from JSON files
ALL_TICKERS = get_all_tickers()


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


def sort_etf_json(path_json: str, index_element: int, path_save: str):
    with open(path_json) as f:
        data = json.load(f)
    sorted_data = sorted(data, key=lambda x: x[index_element])

    with open(path_save, "w", encoding="utf-8") as f:
        json.dump(sorted_data, f, indent=2, ensure_ascii=False)
