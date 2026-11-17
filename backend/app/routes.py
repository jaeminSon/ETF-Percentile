import os
import json
from functools import lru_cache

import numpy as np
from flask import Blueprint, request, jsonify, send_from_directory

from gauger import WINDOWS, load_ticker
from gauger.store import DATA_DIR

main = Blueprint("main", __name__)

home_ads = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
home_images = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "gauger", "image")
)
home_gauger = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "gauger"))

CATEGORY_FILES = {
    "tech": "tech.json",
    "asset": "asset.json",
    "global": "country.json",
    "sector": "sectors.json",
    "index": "index.json",
}


def percentile_of_last(values: np.ndarray) -> float:
    return float(np.mean(values < values[-1]) * 100)


@lru_cache(maxsize=2048)
def _compute(ticker: str, window: int, mtime: float, return_series: bool):
    # mtime is part of the cache key so results refresh after the daily update.
    _, df = load_ticker(ticker)
    if df is None or df.empty:
        return None
    price_ratio = df[f"price_ratio_{window}ma"].to_numpy()
    res = {
        "price_ratio_percentile": percentile_of_last(price_ratio),
        "volume_percentile": percentile_of_last(df["volume"].to_numpy()),
        "ticker": ticker,
        "window": window,
    }
    if return_series:
        res["date"] = df.index.strftime("%Y-%m-%d").tolist()
        res["price_ratio"] = price_ratio.tolist()
    else:
        res["date"] = [df.index[-1].strftime("%Y-%m-%d")]
    return res


def compute(ticker: str, window: int, return_series: bool):
    if not ticker or window not in WINDOWS:
        return None
    mtime, _ = load_ticker(ticker)
    if mtime is None:
        return None
    return _compute(ticker, window, mtime, return_series)


def _respond(ticker, window, return_series):
    res = compute(ticker, window, return_series)
    if res is None:
        return jsonify({"error": f"No data for ticker={ticker}, window={window}."}), 404
    return jsonify(res)


@main.route("/percentile", methods=["GET"])
def get_percentile():
    ticker = request.args.get("ticker", type=str)
    window = request.args.get("window", type=int)
    return _respond(ticker, window, return_series=False)


@main.route("/stocks", methods=["GET"])
def get_stocks():
    ticker = request.args.get("ticker", type=str)
    window = request.args.get("window", type=int)
    return _respond(ticker, window, return_series=True)


@main.route("/page", methods=["GET"])
def get_page_data():
    category = request.args.get("category", type=str)
    if category not in CATEGORY_FILES:
        return jsonify({"error": "Failed to fetch data."}), 404

    with open(os.path.join(home_gauger, CATEGORY_FILES[category]), "r") as f:
        data = json.load(f)

    tickers = [item[0] for item in data if item[0]]
    results = [
        compute(ticker, window, return_series=False)
        for ticker in tickers
        for window in WINDOWS
    ]
    # Tickers whose data is missing are skipped instead of failing the whole page.
    return jsonify([r for r in results if r is not None])


@main.route("/status", methods=["GET"])
def get_status():
    """Result of the last daily update (which tickers succeeded / failed)."""
    try:
        with open(os.path.join(DATA_DIR, "_status.json")) as f:
            return jsonify(json.load(f))
    except FileNotFoundError:
        return jsonify({"error": "No update has run yet."}), 404


@main.route("/app-ads.txt")
def ads_txt():
    return send_from_directory(home_ads, "app-ads.txt")


@main.route("/image/<filename>")
def serve_image(filename):
    return send_from_directory(home_images, filename)
