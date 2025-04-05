from typing import List, Dict, Tuple
from datetime import datetime

from flask import Blueprint, request, jsonify

from gauger.statistics import density_function, distribution

from .models import Stock


main = Blueprint("main", __name__)


def res2list_rows(res: List[object]) -> List[Dict[str, object]]:
    return [r.to_dict() for r in res]


def dist_single_ratio_values(
    list_rows: List[Dict[str, object]],
    key: str,
    date: datetime.date,
    x_range: Tuple[float, float],
):
    ratio = [r[key] for r in list_rows]
    pdf = density_function(ratio)
    x, y = distribution(pdf, x_range)
    x_date = [r[key] for r in list_rows if r["date"] == date]
    y_date = list(pdf(x_date))
    return x, y, x_date, y_date


def dist_all_ratio_values(
    list_rows: List[Dict[str, object]], date: str, window: int
) -> Tuple[List[float], List[float], List[float], List[float]]:
    date = datetime.strptime(date, "%Y-%m-%d").date()

    x_p_ratio, y_p_ratio, x_p_ratio_date, y_p_ratio_date = dist_single_ratio_values(
        list_rows, f"price_ratio_{window}ma", date, (0, 4)
    )

    (
        x_log_volume_ratio,
        y_log_volume_ratio,
        x_log_volume_ratio_date,
        y_log_volume_ratio_date,
    ) = dist_single_ratio_values(
        list_rows, f"log_volume_ratio_{window}ma", date, (-4, 4)
    )

    return {
        "x_p_ratio": x_p_ratio,
        "y_p_ratio": y_p_ratio,
        "x_p_ratio_date": x_p_ratio_date,
        "y_p_ratio_date": y_p_ratio_date,
        "x_log_volume_ratio": x_log_volume_ratio,
        "y_log_volume_ratio": y_log_volume_ratio,
        "x_log_volume_ratio_date": x_log_volume_ratio_date,
        "y_log_volume_ratio_date": y_log_volume_ratio_date,
    }


@main.route("/stocks", methods=["GET"])
def get_stocks():
    ticker = request.args.get("ticker", type=str)
    date = request.args.get("date", type=str)
    window = request.args.get("window", type=int)

    res_data = Stock.query.filter(Stock.date <= date, Stock.ticker == ticker).all()
    list_rows = res2list_rows(res_data)

    res = dist_all_ratio_values(list_rows, date, window)
    return jsonify(res)
