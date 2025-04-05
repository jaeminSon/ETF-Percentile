import time
from typing import List, Dict
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
                log_volume=row["log_volume"],
                log_volume_20ma=row["log_volume_20ma"],
                log_volume_50ma=row["log_volume_50ma"],
                log_volume_100ma=row["log_volume_100ma"],
                log_volume_200ma=row["log_volume_200ma"],
                price_ratio_20ma=row["price_ratio_20ma"],
                price_ratio_50ma=row["price_ratio_50ma"],
                price_ratio_100ma=row["price_ratio_100ma"],
                price_ratio_200ma=row["price_ratio_200ma"],
                log_volume_ratio_20ma=row["log_volume_ratio_20ma"],
                log_volume_ratio_50ma=row["log_volume_ratio_50ma"],
                log_volume_ratio_100ma=row["log_volume_ratio_100ma"],
                log_volume_ratio_200ma=row["log_volume_ratio_200ma"],
            )

            objects.append(obj)

        db.session.add_all(objects)
        db.session.commit()


def initialize_database(exist_ok=False):
    with app.app_context():
        if not table_exists(db.engine, TABLE_STOCK):
            db.create_all()
            stock_data = all_stock_data("1900-01-01")
            save_to_database(stock_data)
        else:
            assert exist_ok, f"Table '{TABLE_STOCK}' already exists."


def remove_from_database(tickers_replace: List[str]):
    Stock.query.filter(Stock.ticker.in_(tickers_replace)).delete()
    db.session.commit()


def save_recent_data_to_database(new_stock_data: Dict[str, pd.DataFrame]):
    tickers_replace = set()

    objects = []
    for ticker in new_stock_data:
        ordered_by_date = Stock.query.filter(Stock.ticker == ticker).order_by(
            Stock.date.desc()
        )
        row_lastest_date = ordered_by_date.first().to_dict()
        row_second_lastest_date = ordered_by_date.offset(1).first().to_dict()

        for index, row in new_stock_data[ticker].iterrows():
            if row_second_lastest_date["date"] == datetime.date(index):
                if abs(row_second_lastest_date["price"] - row["price"]) > 1e-6:
                    # price differ significantly
                    tickers_replace.add(ticker)

            if row_lastest_date["date"] < datetime.date(index):
                obj = Stock(
                    date=index.strftime("%Y-%m-%d"),
                    ticker=ticker,
                    price=row["price"],
                    price_20ma=row["price_20ma"],
                    price_50ma=row["price_50ma"],
                    price_100ma=row["price_100ma"],
                    price_200ma=row["price_200ma"],
                    log_volume=row["log_volume"],
                    log_volume_20ma=row["log_volume_20ma"],
                    log_volume_50ma=row["log_volume_50ma"],
                    log_volume_100ma=row["log_volume_100ma"],
                    log_volume_200ma=row["log_volume_200ma"],
                    price_ratio_20ma=row["price_ratio_20ma"],
                    price_ratio_50ma=row["price_ratio_50ma"],
                    price_ratio_100ma=row["price_ratio_100ma"],
                    price_ratio_200ma=row["price_ratio_200ma"],
                    log_volume_ratio_20ma=row["log_volume_ratio_20ma"],
                    log_volume_ratio_50ma=row["log_volume_ratio_50ma"],
                    log_volume_ratio_100ma=row["log_volume_ratio_100ma"],
                    log_volume_ratio_200ma=row["log_volume_ratio_200ma"],
                )
                objects.append(obj)

    db.session.add_all(objects)
    db.session.commit()

    return list(tickers_replace)


def update_database() -> None:
    with app.app_context():
        print("update databse")
        assert table_exists(db.engine, TABLE_STOCK), "Table does not exist."

        now = datetime.now()
        start_date = (now - timedelta(days=365)).strftime("%Y-%m-%d")
        new_stock_data = all_stock_data(start_date)
        tickers_replace = save_recent_data_to_database(new_stock_data)

        if len(tickers_replace) > 0:
            remove_from_database(tickers_replace)
            updated_stock_data = stock_data(tickers_replace, "1990-01-01")
            save_to_database(updated_stock_data)


if __name__ == "__main__":
    initialize_database(exist_ok=True)

    schedule.every().day.at("08:00").do(update_database)
    while True:
        schedule.run_pending()
        time.sleep(30)
