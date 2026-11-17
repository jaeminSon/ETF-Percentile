"""JSON file store for daily price/volume history downloaded from Yahoo Finance.

One file per ticker under DATA_DIR (default: backend/data). Each file holds the
raw daily close (auto-adjusted) and volume; moving averages and ratios are
derived on read so the stored data never has to be migrated.

File layout:
    {
      "ticker": "SPY",            # ticker as shown in the app
      "source": "SPY",            # symbol actually requested from Yahoo
      "updated_at": "2026-11-16T07:00:00",
      "date":   ["1993-01-29", ...],
      "price":  [24.68, ...],
      "volume": [1003200, ...]
    }
"""

import json
import os
import tempfile
from typing import Dict, Optional, Tuple
from urllib.parse import quote

import pandas as pd

WINDOWS = (20, 50, 100, 200)

DATA_DIR = os.path.abspath(
    os.getenv(
        "DATA_DIR",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data"),
    )
)


def ticker_path(ticker: str) -> str:
    # Tickers contain characters such as ^ = . which are unsafe or awkward in file names.
    return os.path.join(DATA_DIR, quote(ticker, safe="") + ".json")


def save_ticker(ticker: str, source: str, df: pd.DataFrame, updated_at: str) -> None:
    """Atomically write a frame with a DatetimeIndex and price/volume columns."""
    os.makedirs(DATA_DIR, exist_ok=True)
    payload = {
        "ticker": ticker,
        "source": source,
        "updated_at": updated_at,
        "date": df.index.strftime("%Y-%m-%d").tolist(),
        "price": [float(x) for x in df["price"]],
        "volume": [float(x) for x in df["volume"]],
    }
    path = ticker_path(ticker)
    fd, tmp = tempfile.mkstemp(dir=DATA_DIR, prefix=".tmp-", suffix=".json")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(payload, f, separators=(",", ":"))
        os.replace(tmp, path)  # readers never see a half-written file
    except BaseException:
        if os.path.exists(tmp):
            os.remove(tmp)
        raise


def read_ticker(ticker: str) -> Optional[pd.DataFrame]:
    path = ticker_path(ticker)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        payload = json.load(f)
    return pd.DataFrame(
        {"price": payload["price"], "volume": payload["volume"]},
        index=pd.to_datetime(payload["date"]),
    )


def with_moving_averages(df: pd.DataFrame) -> pd.DataFrame:
    """Add price_{w}ma and price_ratio_{w}ma columns.

    Rows are kept only where every window has a value (i.e. from the 200th
    trading day on), matching what the old Postgres tables contained.
    """
    out = df.copy()
    for w in WINDOWS:
        out[f"price_{w}ma"] = out["price"].rolling(window=w).mean()
        out[f"price_ratio_{w}ma"] = out["price"] / out[f"price_{w}ma"]
    return out.dropna()


# Per-process cache: ticker -> (mtime, frame with moving averages).
# Keyed on file mtime so a gunicorn worker picks up the daily update without restarting.
_cache: Dict[str, Tuple[float, pd.DataFrame]] = {}


def load_ticker(ticker: str) -> Tuple[Optional[float], Optional[pd.DataFrame]]:
    path = ticker_path(ticker)
    try:
        mtime = os.stat(path).st_mtime
    except FileNotFoundError:
        return None, None
    cached = _cache.get(ticker)
    if cached and cached[0] == mtime:
        return cached
    df = read_ticker(ticker)
    if df is None:
        return None, None
    entry = (mtime, with_moving_averages(df))
    _cache[ticker] = entry
    return entry
