from typing import List, Dict
from collections import defaultdict
from functools import lru_cache
from datetime import date

import numpy as np
from flask import Blueprint, request, jsonify

from .database import StockModels, initialize_tables, update_database

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
    all_dates = [e.strftime("%Y-%m-%d") for e in d["date"]]
    price_ratio = d[f"price_ratio_{window}ma"]
    price_ratio_percentile = percentile(price_ratio, len(all_dates) - 1)
    volume_percentile = percentile(d["volume"], len(all_dates) - 1)

    return {
        "date": all_dates,
        "price_ratio": price_ratio,
        "price_ratio_percentile": price_ratio_percentile,
        "volume_percentile": volume_percentile,
    }


@lru_cache(maxsize=48)
def serve(ticker: str, window: int, today: date):
    db_model = StockModels[ticker]
    res_data = db_model.query.order_by(db_model.date.asc()).all()
    d = res2dict(res_data)
    res = extract_data(d, window)
    res["ticker"] = ticker
    res["window"] = window
    return jsonify(res)


@main.route("/stocks", methods=["GET"])
def get_stocks():
    ticker = request.args.get("ticker", type=str)
    window = request.args.get("window", type=int)
    today = date.today()
    return serve(ticker, window, today)


@main.route("/update-database", methods=["POST"])
def update_db():
    initialize_tables()
    update_database()
    return "Database updated", 200
