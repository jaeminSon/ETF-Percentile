from typing import List, Dict, Tuple
from collections import defaultdict
from datetime import datetime

import numpy as np
from flask import Blueprint, request, jsonify

from gauger.statistics import density_function, distribution

from .models import Stock


main = Blueprint("main", __name__)


def res2dict(res: List[object]) -> Dict[str, List[object]]:
    d = defaultdict(list)
    for r in res:
        for k, v in r.to_dict().items():
            d[k].append(v)
    return d


def percentile(values: List[float], index_target: int) -> float:
    target_value = values[index_target]
    return np.mean(np.array(values) < target_value) * 100


def find_index_target(dates: List[datetime.date], date: datetime.date) -> int:
    for i in range(len(dates) - 1, -1, -1):
        if dates[i] == date:
            return i


def price_ratio_and_percentiles(
    d: Dict[str, List[object]], date: str, window: int
) -> Tuple[List[float], List[float], List[float], List[float]]:
    date = datetime.strptime(date, "%Y-%m-%d").date()

    index_target = find_index_target(d["date"], date)
    price_ratio_percentile = percentile(d[f"price_ratio_{window}ma"], index_target)
    volume_percentile = percentile(d["volume"], index_target)

    return {
        "price_ratio": d[f"price_ratio_{window}ma"],
        "price_ratio_percent": price_ratio_percentile,
        "volume_percent": volume_percentile,
    }


@main.route("/stocks", methods=["GET"])
def get_stocks():
    ticker = request.args.get("ticker", type=str)
    date = request.args.get("date", type=str)
    window = request.args.get("window", type=int)

    res_data = Stock.query.filter(Stock.date <= date, Stock.ticker == ticker).all()
    d = res2dict(res_data)

    # TODO return if values in db

    res = price_ratio_and_percentiles(d, date, window)
    return jsonify(res)
