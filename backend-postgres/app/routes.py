import os
import json
from typing import List, Dict
from collections import defaultdict
from functools import lru_cache

import numpy as np
from flask import Blueprint, request, jsonify, send_from_directory

from .database import StockModels, initialize_tables, update_database

main = Blueprint("main", __name__)

home_ads = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
home_images = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "gauger", "image")
)
home_gauger = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "gauger"))


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
    d: Dict[str, List[object]], window: int, return_series: bool = True
) -> Dict[str, object]:
    all_dates = [e.strftime("%Y-%m-%d") for e in d["date"]]
    price_ratio = d[f"price_ratio_{window}ma"]
    price_ratio_percentile = percentile(price_ratio, len(all_dates) - 1)
    volume_percentile = percentile(d["volume"], len(all_dates) - 1)

    if return_series:
        return {
            "date": all_dates,
            "price_ratio": price_ratio,
            "price_ratio_percentile": price_ratio_percentile,
            "volume_percentile": volume_percentile,
        }
    else:
        return {
            "date": all_dates[-1:],
            "price_ratio_percentile": price_ratio_percentile,
            "volume_percentile": volume_percentile,
        }


@lru_cache(maxsize=512)
def serve(ticker: str, window: int):
    db_model = StockModels[ticker]
    res_data = db_model.query.order_by(db_model.date.asc()).all()
    d = res2dict(res_data)
    res = extract_data(d, window)
    res["ticker"] = ticker
    res["window"] = window
    return res


@lru_cache(maxsize=512)
def serve_percentile(ticker: str, window: int):
    db_model = StockModels[ticker]
    res_data = db_model.query.order_by(db_model.date.asc()).all()
    d = res2dict(res_data)
    res = extract_data(d, window, return_series=False)
    res["ticker"] = ticker
    res["window"] = window
    return res


@main.route("/percentile", methods=["GET"])
def get_percentile():
    ticker = request.args.get("ticker", type=str)
    window = request.args.get("window", type=int)
    return jsonify(serve_percentile(ticker, window))


@main.route("/stocks", methods=["GET"])
def get_stocks():
    ticker = request.args.get("ticker", type=str)
    window = request.args.get("window", type=int)
    return jsonify(serve(ticker, window))


@main.route("/page", methods=["GET"])
def get_page_data():
    category = request.args.get("category", type=str)
    category_map = {
        "tech": "tech.json",
        "asset": "asset.json",
        "global": "country.json",
        "sector": "sectors.json",
        "index": "index.json",
    }

    try:
        json_file_path = os.path.join(home_gauger, category_map[category])
        with open(json_file_path, "r") as f:
            data = json.load(f)

        tickers = [item[0] for item in data if item[0]]
        return jsonify(
            [
                serve_percentile(ticker, window)
                for ticker in tickers
                for window in [20, 50, 100, 200]
            ]
        )
    except FileNotFoundError:
        return jsonify({"error": "Failed to fetch data."}), 404


@main.route("/update-database", methods=["POST"])
def update_db():
    initialize_tables()
    update_database()
    serve.cache_clear()
    serve_percentile.cache_clear()
    return "Database updated", 200


@main.route("/app-ads.txt")
def ads_txt():
    return send_from_directory(home_ads, "app-ads.txt")


@main.route("/image/<filename>")
def serve_image(filename):
    return send_from_directory(home_images, filename)
