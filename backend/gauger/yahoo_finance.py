"""Ticker lists and Yahoo Finance downloads shared by the app and the research scripts."""

import json
import os
import time
from datetime import datetime, timedelta
from io import StringIO
from typing import Dict, Iterable, List, Optional, Tuple

import numpy as np
import pandas as pd
import requests
import yfinance as yf

GAUGER_DIR = os.path.dirname(os.path.abspath(__file__))
# Ticker lists ([[ticker, name], ...]) are looked up in backend/tickers first,
# then next to this file (the app's category lists: index, tech, asset, country, sectors).
TICKERS_DIR = os.path.abspath(os.path.join(GAUGER_DIR, "..", "tickers"))
TICKER_DIRS = (TICKERS_DIR, GAUGER_DIR)

SP500_WIKI_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"


# --------------------------------------------------------------------------
# Ticker lists
# --------------------------------------------------------------------------


def ticker_list_path(group: str) -> str:
    name = group.lower()
    for d in TICKER_DIRS:
        path = os.path.join(d, f"{name}.json")
        if os.path.exists(path):
            return path
    raise FileNotFoundError(
        f"No ticker list '{name}.json' in {' or '.join(TICKER_DIRS)}"
    )


def load_ticker_list(path_or_group: str) -> List[Tuple[str, str]]:
    """[[ticker, name], ...] from a JSON path or a group name (e.g. "sectors", "sp500")."""
    path = (
        path_or_group
        if path_or_group.endswith(".json")
        else ticker_list_path(path_or_group)
    )
    with open(path) as f:
        return [(item[0], item[1] if len(item) > 1 else item[0]) for item in json.load(f)]


def get_ticker(group: str) -> List[str]:
    if group.lower() == "s&p500":
        return [t for t, _ in fetch_sp500()]
    return [t for t, _ in load_ticker_list(group)]


def ticker2name(group: str) -> Dict[str, str]:
    return dict(load_ticker_list(group))


def fetch_sp500() -> List[Tuple[str, str]]:
    """Current S&P 500 constituents from Wikipedia as [(yahoo_ticker, name), ...]."""
    res = requests.get(
        SP500_WIKI_URL, headers={"User-Agent": "Mozilla/5.0 (gauger)"}, timeout=30
    )
    res.raise_for_status()
    table = pd.read_html(StringIO(res.text))[0]
    # Wikipedia writes share classes as BRK.B; Yahoo uses BRK-B.
    return [
        (str(sym).replace(".", "-"), str(name))
        for sym, name in zip(table["Symbol"], table["Security"])
    ]


def refresh_sp500_list(path: str = os.path.join(TICKERS_DIR, "sp500.json")) -> str:
    """Rewrite tickers/sp500.json from Wikipedia; keep the old file if that fails."""
    try:
        pairs = fetch_sp500()
        if len(pairs) < 450:
            raise ValueError(f"only {len(pairs)} rows parsed")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump([list(p) for p in pairs], f, indent=2, ensure_ascii=False)
    except Exception as e:
        if not os.path.exists(path):
            raise
        print(f"Could not refresh S&P 500 list ({e!r}); using existing {path}")
    return path


def _app_tickers() -> List[str]:
    """All tickers shown in the app, in category order, without duplicates."""
    seen, tickers = set(), []
    for group in ("index", "asset", "tech", "country", "sectors"):
        try:
            group_tickers = [t for t, _ in load_ticker_list(group)]
        except FileNotFoundError:
            print(f"Warning: ticker list for '{group}' not found.")
            continue
        for t in group_tickers:
            if t and t not in seen:
                seen.add(t)
                tickers.append(t)
    return tickers


ALL_TICKERS = _app_tickers()


def all_tickers() -> List[str]:
    return ALL_TICKERS


# --------------------------------------------------------------------------
# Downloads
# --------------------------------------------------------------------------


def download(symbol, start_date, end_date) -> pd.DataFrame:
    """Raw yf.download (MultiIndex columns: field, ticker)."""
    return yf.download(
        symbol, start=start_date, end=end_date, auto_adjust=True, progress=False
    )


def download_by_group(
    group: str, start_date: str, end_date: Optional[str] = None
) -> pd.DataFrame:
    if end_date is None:
        start_date, end_date = period(start_date)
    return download(get_ticker(group), start_date, end_date)


def flatten_columns(df: pd.DataFrame, ticker: Optional[str] = None) -> pd.DataFrame:
    """Reduce a yfinance frame to flat OHLCV columns and a tz-naive daily index.

    yfinance has changed its column layout several times (flat vs. MultiIndex,
    field/ticker level order), so locate the levels instead of assuming them.
    """
    if isinstance(df.columns, pd.MultiIndex):
        if ticker is not None:
            for level in range(df.columns.nlevels):
                if ticker in df.columns.get_level_values(level):
                    df = df.xs(ticker, axis=1, level=level)
                    break
        if isinstance(df.columns, pd.MultiIndex):
            for level in range(df.columns.nlevels):
                if "Close" in df.columns.get_level_values(level):
                    df = df.copy()
                    df.columns = df.columns.get_level_values(level)
                    break
    df = df.loc[:, ~df.columns.duplicated()].copy()
    index = pd.to_datetime(df.index)
    if index.tz is not None:
        index = index.tz_localize(None)  # keep the exchange-local calendar date
    df.index = index.normalize()
    return df


def to_price_volume(raw: pd.DataFrame, ticker: Optional[str] = None) -> Optional[pd.DataFrame]:
    """Normalize a yfinance frame into columns price (adjusted close) and volume."""
    if raw is None or raw.empty:
        return None
    df = flatten_columns(raw, ticker)
    if "Close" not in df.columns:
        return None
    out = pd.DataFrame(
        {
            "price": pd.to_numeric(df["Close"], errors="coerce"),
            "volume": (
                pd.to_numeric(df["Volume"], errors="coerce")
                if "Volume" in df.columns
                else 0.0
            ),
        },
        index=df.index,
    )
    out = out[out["price"].notna() & (out["price"] > 0)]
    out["volume"] = out["volume"].fillna(0.0)
    out = out[~out.index.duplicated(keep="last")].sort_index()
    return out if not out.empty else None


def download_history(symbol: str, retries: int = 3, log=print) -> Optional[pd.DataFrame]:
    """Full daily price/volume history of one symbol (yf.download, then Ticker.history)."""
    fetchers = (
        lambda: yf.download(
            symbol,
            period="max",
            interval="1d",
            auto_adjust=True,
            progress=False,
            threads=False,
        ),
        lambda: yf.Ticker(symbol).history(period="max", interval="1d", auto_adjust=True),
    )
    for attempt in range(1, retries + 1):
        for fetch in fetchers:
            try:
                df = to_price_volume(fetch(), symbol)
                if df is not None:
                    return df
            except Exception as e:  # yfinance raises many different error types
                log(f"{symbol}: download attempt {attempt} failed: {e!r}")
        time.sleep(2 * attempt)
    return None


# Process-wide cache so one script run downloads each ticker only once.
_histories: Dict[str, pd.DataFrame] = {}


def download_histories(
    tickers: Iterable[str], chunk_size: int = 100
) -> Dict[str, pd.DataFrame]:
    """Full daily price/volume history for many tickers, batched.

    Returns {ticker: DataFrame[price, volume]}; tickers Yahoo returns nothing
    for are retried one by one and left out if they still fail.
    """
    tickers = list(dict.fromkeys(tickers))
    missing = [t for t in tickers if t not in _histories]
    for i in range(0, len(missing), chunk_size):
        chunk = missing[i : i + chunk_size]
        try:
            raw = yf.download(
                chunk,
                period="max",
                interval="1d",
                auto_adjust=True,
                group_by="ticker",
                threads=True,
                progress=False,
            )
        except Exception as e:
            print(f"Batch download failed ({e!r}); falling back to one by one")
            raw = None
        for t in chunk:
            df = None
            if raw is not None:
                try:
                    df = to_price_volume(raw, t)
                except Exception:
                    df = None
            if df is None:
                df = download_history(t, retries=2)
            if df is not None:
                _histories[t] = df
            else:
                print(f"{t}: no data from Yahoo Finance; skipped")
    return {t: _histories[t] for t in tickers if t in _histories}


# --------------------------------------------------------------------------
# Returns
# --------------------------------------------------------------------------


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


def yf_growth(yf_df: pd.DataFrame, key="Close") -> pd.DataFrame:
    """Growth of 1 dollar invested at the start (starts at 1.0)."""
    return (percent_change(yf_df, key) + 1).cumprod()


def yf_return(yf_df: pd.DataFrame, key="Close") -> pd.DataFrame:
    """Cumulative return (starts at 0.0)."""
    return yf_growth(yf_df, key) - 1


def expected_return_from_pct_ch(pct_ch: pd.DataFrame) -> np.ndarray:
    return np.array(pct_ch).mean(axis=0)


def sort_etf_json(path_json: str, index_element: int, path_save: str):
    with open(path_json) as f:
        data = json.load(f)
    sorted_data = sorted(data, key=lambda x: x[index_element])

    with open(path_save, "w", encoding="utf-8") as f:
        json.dump(sorted_data, f, indent=2, ensure_ascii=False)
