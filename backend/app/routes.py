from flask import Blueprint, request, jsonify

from .models import Stock

main = Blueprint("main", __name__)


@main.route("/stocks", methods=["GET"])
def get_stocks():
    ticker = request.args.get("ticker", type=str)
    date = request.args.get("date", type=str)
    res = Stock.query.filter(Stock.date <= date, Stock.ticker == ticker).all()

    return jsonify([])
    return jsonify([r.to_dict() for r in res])
