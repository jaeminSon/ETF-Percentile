from typing import List, Dict, Tuple
from collections import defaultdict
from datetime import datetime

import numpy as np
from flask import Blueprint, request, jsonify

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


def extract_data(d: Dict[str, List[object]], window: int) -> Dict[str, object]:
    ticker = d["ticker"][0]
    all_dates = [e.strftime("%Y-%m-%d") for e in d["date"]]
    price_ratio = d[f"price_ratio_{window}ma"]
    price_ratio_percentile = percentile(price_ratio, len(all_dates) - 1)
    volume_percentile = percentile(d["volume"], len(all_dates) - 1)

    return {
        "ticker": ticker,
        "date": all_dates,
        "price_ratio": price_ratio,
        "price_ratio_percentile": price_ratio_percentile,
        "volume_percentile": volume_percentile,
    }


@main.route("/stocks", methods=["GET"])
def get_stocks():
    ticker = request.args.get("ticker", type=str)
    window = request.args.get("window", type=int)

    res_data = (
        Stock.query.filter(Stock.ticker == ticker).order_by(Stock.date.asc()).all()
    )
    d = res2dict(res_data)

    # TODO return if values in db

    res = extract_data(d, window)
    res["window"] = window
    return jsonify(res)
