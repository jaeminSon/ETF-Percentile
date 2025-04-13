import time
from typing import List, Dict, Tuple
from datetime import datetime, timedelta

import pandas as pd
import schedule
from sqlalchemy.engine.reflection import Inspector


from gauger import all_stock_data, stock_data
from app.models import Stock
from run import app, db


TABLE_STOCK = "stock"


def table_exists(engine, table_name):
    inspector = Inspector.from_engine(engine)
    return table_name in inspector.get_table_names()


def save_to_database(stock_data: Dict[str, pd.DataFrame]) -> None:
    objects = []
    for ticker in stock_data:
        for index, row in stock_data[ticker].iterrows():
            obj = Stock(
                date=index.strftime("%Y-%m-%d"),
                ticker=ticker,
                price=row["price"],
                price_20ma=row["price_20ma"],
                price_50ma=row["price_50ma"],
                price_100ma=row["price_100ma"],
                price_200ma=row["price_200ma"],
                price_ratio_20ma=row["price_ratio_20ma"],
                price_ratio_50ma=row["price_ratio_50ma"],
                price_ratio_100ma=row["price_ratio_100ma"],
                price_ratio_200ma=row["price_ratio_200ma"],
                volume=row["volume"],
            )
            objects.append(obj)

    db.session.add_all(objects)
    db.session.commit()


def initialize_database(exist_ok=False):
    with app.app_context():
        if not table_exists(db.engine, TABLE_STOCK):
            db.create_all()
            stock_data = all_stock_data("1900-01-01", "2025-04-09")
            save_to_database(stock_data)
        else:
            assert exist_ok, f"Table '{TABLE_STOCK}' already exists."


def remove_from_database(tickers_replace: List[str]):
    Stock.query.filter(Stock.ticker.in_(tickers_replace)).delete()
    db.session.commit()


def compute_ma(curr_price: float, prev_data: List[Dict]) -> Tuple[Dict, Dict]:
    ma = {}
    for window in [20, 50, 100, 200]:
        ma[f"price_{window}ma"] = (
            prev_data[-1][f"price_{window}ma"]
            + (curr_price - prev_data[-window]["price"]) / window
        )
        ma[f"price_ratio_{window}ma"] = curr_price / ma[f"price_{window}ma"]
    return ma


def save_recent_data_to_database(new_stock_data: Dict[str, pd.DataFrame]) -> List[str]:
    tickers_replace = set()

    objects = []
    for ticker in new_stock_data:
        db_ordered_by_date = (
            Stock.query.filter(Stock.ticker == ticker).order_by(Stock.date.asc()).all()
        )

        working_data = [e.to_dict() for e in db_ordered_by_date[-200:]]

        for index, row in new_stock_data[ticker].iterrows():
            date = datetime.date(index)

            if (index == 0) and working_data[-1]["date"] < date:
                # no dates overlap
                tickers_replace.add(ticker)
                break

            if (working_data[-1]["date"] == date) and (
                abs(working_data[-1]["price"] - row["price"]) > 1e-3
            ):
                # price differ significantly
                tickers_replace.add(ticker)
                break

            if working_data[-1]["date"] < date:
                datum = compute_ma(row["price"], working_data)
                datum["date"] = date
                datum["price"] = row["price"]
                working_data.append(datum)

                obj = Stock(
                    date=index.strftime("%Y-%m-%d"),
                    ticker=ticker,
                    price=row["price"],
                    price_20ma=datum["price_20ma"],
                    price_50ma=datum["price_50ma"],
                    price_100ma=datum["price_100ma"],
                    price_200ma=datum["price_200ma"],
                    price_ratio_20ma=datum["price_ratio_20ma"],
                    price_ratio_50ma=datum["price_ratio_50ma"],
                    price_ratio_100ma=datum["price_ratio_100ma"],
                    price_ratio_200ma=datum["price_ratio_200ma"],
                    volume=int(row["volume"]),
                )
                objects.append(obj)

    db.session.add_all(objects)
    db.session.commit()

    return list(tickers_replace)


def update_database() -> None:
    with app.app_context():
        print("update database")
        assert table_exists(db.engine, TABLE_STOCK), "Table does not exist."

        now = datetime.now()
        start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
        new_stock_data = all_stock_data(start_date, return_moving_average=False)
        tickers_replace = save_recent_data_to_database(new_stock_data)
        if len(tickers_replace) > 0:
            print(f"update {tickers_replace}")
            remove_from_database(tickers_replace)
            updated_stock_data = stock_data(tickers_replace, "1990-01-01", return_moving_average=True)
            save_to_database(updated_stock_data)


if __name__ == "__main__":
    initialize_database(exist_ok=True)
    update_database()

    schedule.every().day.at("08:00").do(update_database)
    while True:
        schedule.run_pending()
        time.sleep(30)
