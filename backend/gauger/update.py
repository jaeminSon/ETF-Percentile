"""Download full daily history for every ticker from Yahoo Finance and save it as JSON.

Run once a day (e.g. from cron) after the US market closes:

    python -m gauger.update              # all tickers
    python -m gauger.update SPY QQQ      # only these

Every run re-downloads the whole history instead of appending, so splits,
dividend re-adjustments and Yahoo-side corrections are always picked up.
A ticker whose download fails or looks wrong keeps its previous file.
"""

import fcntl
import json
import os
import sys
import time
from datetime import datetime
from typing import Dict, List, Optional

import pandas as pd
import yfinance as yf

from .log import logger
from .store import DATA_DIR, read_ticker, save_ticker
from .yahoo_finance import all_tickers

# Yahoo stopped serving some index symbols; serve the sector ETF instead.
SOURCE_OVERRIDES = {
    "^SP500-25": "XLY",
    "^SP500-30": "XLP",
    "^SP500-55": "XLU",
    "^SP500-35": "XLV",
    "^GSPE": "XLE",
    "^SP500-40": "VFH",
    "^SP500-20": "XLI",
    "^SP500-15": "XLB",
    "^SP500-60": "XLRE",
    "^SP500-45": "XLC",
}

RETRIES = 3
# A fresh download shorter than this fraction of the stored history is treated
# as a truncated/bad response and rejected.
MIN_LENGTH_RATIO = 0.9


def _flatten(df: pd.DataFrame) -> pd.DataFrame:
    """Reduce a yfinance frame to a DatetimeIndex with flat OHLCV column names.

    yfinance has changed its column layout several times (flat vs. MultiIndex,
    level order), so locate the level that holds the field names instead of
    assuming one.
    """
    if isinstance(df.columns, pd.MultiIndex):
        for level in range(df.columns.nlevels):
            if "Close" in df.columns.get_level_values(level):
                df = df.copy()
                df.columns = df.columns.get_level_values(level)
                break
    df = df.loc[:, ~df.columns.duplicated()]
    index = pd.to_datetime(df.index)
    if index.tz is not None:
        # Keep the exchange-local calendar date.
        index = index.tz_localize(None)
    df.index = index.normalize()
    return df


def _normalize(raw: pd.DataFrame) -> Optional[pd.DataFrame]:
    if raw is None or raw.empty:
        return None
    df = _flatten(raw)
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


def download_history(symbol: str) -> Optional[pd.DataFrame]:
    """Full daily history, trying yf.download first and Ticker.history as a fallback."""
    fetchers = (
        lambda: yf.download(
            symbol,
            period="max",
            interval="1d",
            auto_adjust=True,
            progress=False,
            threads=False,
        ),
        lambda: yf.Ticker(symbol).history(
            period="max", interval="1d", auto_adjust=True
        ),
    )
    for attempt in range(1, RETRIES + 1):
        for fetch in fetchers:
            try:
                df = _normalize(fetch())
                if df is not None:
                    return df
            except Exception as e:  # yfinance raises many different error types
                logger.warning(f"{symbol}: download attempt {attempt} failed: {e!r}")
        time.sleep(2 * attempt)
    return None


def _validate(ticker: str, new: pd.DataFrame) -> Optional[str]:
    """Return a reason to reject the new download, or None if it looks sane."""
    old = read_ticker(ticker)
    if old is None or old.empty:
        return None
    if new.index[-1] < old.index[-1]:
        return f"latest date {new.index[-1].date()} is older than stored {old.index[-1].date()}"
    if len(new) < MIN_LENGTH_RATIO * len(old):
        return f"only {len(new)} rows vs {len(old)} stored"
    return None


def update_ticker(ticker: str, updated_at: str) -> bool:
    source = SOURCE_OVERRIDES.get(ticker, ticker)
    df = download_history(source)
    if df is None:
        logger.error(f"{ticker}: no data from Yahoo Finance; keeping previous file")
        return False
    reason = _validate(ticker, df)
    if reason:
        logger.error(f"{ticker}: rejected download ({reason}); keeping previous file")
        return False
    save_ticker(ticker, source, df, updated_at)
    logger.info(f"{ticker}: saved {len(df)} rows up to {df.index[-1].date()}")
    return True


def update_all(tickers: Optional[List[str]] = None) -> Dict[str, List[str]]:
    tickers = tickers or all_tickers()
    os.makedirs(DATA_DIR, exist_ok=True)

    # Only one update at a time (cron overlap, manual run, ...).
    lock = open(os.path.join(DATA_DIR, ".update.lock"), "w")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        logger.warning("Another update is already running; skipping")
        lock.close()
        return {"ok": [], "failed": [], "skipped": tickers}

    try:
        started = datetime.now()
        updated_at = started.isoformat(timespec="seconds")
        result = {"ok": [], "failed": []}
        for ticker in tickers:
            ok = update_ticker(ticker, updated_at)
            result["ok" if ok else "failed"].append(ticker)
            time.sleep(0.5)  # be gentle with Yahoo's rate limiting

        status = {
            "started_at": updated_at,
            "finished_at": datetime.now().isoformat(timespec="seconds"),
            "yfinance_version": getattr(yf, "__version__", "unknown"),
            **result,
        }
        with open(os.path.join(DATA_DIR, "_status.json"), "w") as f:
            json.dump(status, f, indent=2)
        logger.info(
            f"Update finished: {len(result['ok'])} ok, {len(result['failed'])} failed {result['failed']}"
        )
        return result
    finally:
        fcntl.flock(lock, fcntl.LOCK_UN)
        lock.close()


def main(argv: List[str]) -> int:
    result = update_all(argv or None)
    return 1 if result["failed"] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
