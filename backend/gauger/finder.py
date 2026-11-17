"""Screens over a list of tickers: rebounding stocks and price/MA valuation ranks."""

import json
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

import numpy as np

from .stats import latest_ma_percentile
from .yahoo_finance import download_histories, load_ticker_list


def _write_json(data, path: str) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def compute_p_ratio(path_json: str, windows: Sequence[int] = (100, 200)) -> Dict:
    """Percentile of today's price/MA ratio for each ticker in [[ticker, name], ...].

    Returns {ticker: {"name": name, "p_ratio": {window: percentile, ...}}}; a window
    longer than the ticker's history gets 101.
    """
    ticker_names = load_ticker_list(path_json)
    histories = download_histories([t for t, _ in ticker_names])

    results = {}
    for ticker, name in ticker_names:
        if ticker not in histories:
            continue
        price = histories[ticker]["price"]
        results[ticker] = {
            "name": name,
            "p_ratio": {w: latest_ma_percentile(price, w) for w in windows},
        }
    return results


def compute_valuation(path_json: str, save_path: str) -> Dict:
    results = compute_p_ratio(path_json)
    _write_json(results, save_path)
    return results


def _gradient(series) -> Tuple[float, float]:
    """Slope of a linear fit in % of the mean per day, and the fit's R^2."""
    y = np.asarray(series, dtype=float)
    x = np.arange(len(y))
    slope, intercept = np.polyfit(x, y, 1)
    predicted = slope * x + intercept
    ss_res = np.sum((y - predicted) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0
    return float(slope / np.mean(y) * 100), float(r2)


def rebound_stocks(
    input_json: str,
    output_json: str,
    ma_period: int = 100,
    gradient_days: int = 60,
    volume_percentile: float = 95.0,
    min_r2: float = 0.25,
    require_price_below_ma: bool = True,
    windows: Sequence[int] = (100, 200),
) -> Dict:
    """Find tickers whose MA downtrend is slowing down, on unusually high volume.

    A ticker qualifies when, over the last 2 * gradient_days of its MA:
      - the MA fell in both halves, but less steeply in the recent half,
      - the recent half is a reasonably clean line (R^2 >= min_r2),
      - today's close is below the MA (if require_price_below_ma),
      - today's volume is above the volume_percentile of all earlier days.
    Results are sorted by deceleration, then volume ratio.
    """
    ticker_names = dict(load_ticker_list(input_json))
    histories = download_histories(list(ticker_names))

    results: List[Dict] = []
    for ticker, name in ticker_names.items():
        if ticker not in histories:
            continue
        close = histories[ticker]["price"]
        volume = histories[ticker]["volume"]

        ma = close.rolling(ma_period).mean().dropna()
        if len(ma) < gradient_days * 2:
            continue

        previous_gradient, previous_r2 = _gradient(ma.iloc[-gradient_days * 2 : -gradient_days])
        recent_gradient, recent_r2 = _gradient(ma.iloc[-gradient_days:])

        downtrend_slowing = previous_gradient < 0 and previous_gradient < recent_gradient < 0
        trend_quality = recent_r2 >= min_r2

        latest_close = float(close.iloc[-1])
        latest_ma = float(ma.iloc[-1])
        price_condition = not require_price_below_ma or latest_close < latest_ma

        historical_volume = volume.iloc[:-1]
        historical_volume = historical_volume[historical_volume > 0]
        if historical_volume.empty:
            continue
        volume_threshold = float(np.percentile(historical_volume, volume_percentile))
        latest_volume = float(volume.iloc[-1])
        high_volume = latest_volume > volume_threshold

        if not (downtrend_slowing and trend_quality and price_condition and high_volume):
            continue

        deceleration = (recent_gradient - previous_gradient) / abs(previous_gradient) * 100

        result = {
            "ticker": ticker,
            "name": name,
            "date": close.index[-1].strftime("%Y-%m-%d"),
            "close": round(latest_close, 4),
            f"ma{ma_period}": round(latest_ma, 4),
            "previous_gradient": round(previous_gradient, 5),
            "recent_gradient": round(recent_gradient, 5),
            "deceleration_pct": round(deceleration, 2),
            "previous_r2": round(previous_r2, 4),
            "recent_r2": round(recent_r2, 4),
            "latest_volume": int(latest_volume),
            "volume_threshold": int(volume_threshold),
            "volume_ratio": round(latest_volume / volume_threshold, 2),
        }
        result.update({f"p_ratio_ma_{w}": latest_ma_percentile(close, w) for w in windows})
        results.append(result)

    results.sort(key=lambda x: (x["deceleration_pct"], x["volume_ratio"]), reverse=True)

    output = {
        "results": results,
        "summary": {"total_tickers": len(ticker_names), "qualified": len(results)},
    }
    _write_json(output, output_json)
    return output


def sort_valuation(json_paths: List[str], path_save: str = None) -> List[Dict]:
    """Merge valuation files and rank tickers by score = -(p100 + p200), ascending.

    So the highest price/MA percentiles (most stretched above their MAs) come first;
    tickers too new for a 100/200-day MA count as 101 and also sort to the top.

    Tickers missing either percentile go to the end.
    """
    all_results = {}
    for path in json_paths:
        with open(path) as f:
            all_results.update(json.load(f))

    def score(info) -> float:
        p = info["p_ratio"]
        p100 = p.get("100", p.get(100))
        p200 = p.get("200", p.get(200))
        if p100 is None or p200 is None:
            return float("inf")
        return -p100 - p200

    sorted_results = sorted(
        (
            {"ticker": ticker, "score": score(info), "info": info}
            for ticker, info in all_results.items()
        ),
        key=lambda x: x["score"],
    )

    print("====================\nSorted by score (ascending):\n====================")
    for entry in sorted_results:
        print(f"{entry['ticker']:8s} score {entry['score']:8.2f}  {json.dumps(entry['info'])}")

    if path_save:
        _write_json(sorted_results, path_save)
    return sorted_results
