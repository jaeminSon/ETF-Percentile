"""Small numeric helpers shared by the plots, the finder and the portfolio code."""

from typing import Callable, List, Sequence

import numpy as np
import pandas as pd
import scipy.stats


def percentile(values: Sequence[float], index_target: int) -> float:
    """Percentage of values strictly below values[index_target]."""
    values = np.asarray(values, dtype=float)
    return float(np.mean(values < values[index_target]) * 100)


def divide_by_rolling_ma(series: pd.Series, window: int) -> pd.Series:
    return (series / series.rolling(window=window).mean()).dropna()


def latest_ma_percentile(series: pd.Series, window: int) -> float:
    """Percentile of today's price/MA ratio within its own history.

    Returns 101 (treated as "infinitely expensive") when the history is too
    short to compute the moving average.
    """
    if len(series) <= window:
        return 101
    ratios = divide_by_rolling_ma(series, window)
    if ratios.empty:
        return 101
    return percentile(ratios.to_numpy(), len(ratios) - 1)


def density_function(x: List[float]) -> Callable:
    return scipy.stats.gaussian_kde(x)


def integral(p: Callable, start: float, end=2, n_samples=1000) -> float:
    x = np.linspace(start, end, n_samples)
    return np.sum([(x[i] - x[i - 1]) * p(x[i - 1]) for i in range(1, len(x))])
