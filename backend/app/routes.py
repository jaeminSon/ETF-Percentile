from typing import List, Dict
from collections import defaultdict

import numpy as np
from flask import Blueprint, request, jsonify

from .models import Stock
from .database import initialize_database, update_database

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


def extract_data(
    d: Dict[str, List[object]], window: int, n_data: int = 50
) -> Dict[str, object]:
    ticker = d["ticker"][0]
    all_dates = [e.strftime("%Y-%m-%d") for e in d["date"]]
    price_ratio = d[f"price_ratio_{window}ma"]
    price_ratio_percentile = percentile(price_ratio, len(all_dates) - 1)
    volume_percentile = percentile(d["volume"], len(all_dates) - 1)

    interval = len(all_dates) // n_data

    return {
        "ticker": ticker,
        "date": all_dates[-interval * (n_data - 1) - 1 :: interval],
        "price_ratio": price_ratio[-interval * (n_data - 1) - 1 :: interval],
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


@main.route("/update-database", methods=["POST"])
def update_db():
    initialize_database(exist_ok=True)
    update_database()
    return "Database updated", 200
