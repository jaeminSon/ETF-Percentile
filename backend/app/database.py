import math
from typing import List, Dict, Tuple
from datetime import datetime, timedelta

import pandas as pd
from sqlalchemy.engine.reflection import Inspector


from gauger import all_stock_data, stock_data, all_tickers

from .models import Stock
from .extensions import db
from .log import logger


def create_stock_model(ticker):
    class_name = f"Stock_{ticker.upper()}"
    table_name = ticker

    return type(
        class_name,
        (Stock,),
        {
            "__tablename__": table_name,
            "__module__": __name__,
        },
    )


tickers = all_tickers()
StockModels = {t: create_stock_model(t) for t in tickers}


def table_exists(engine, table_name):
    inspector = Inspector.from_engine(engine)
    return table_name in inspector.get_table_names()


def save_to_database(stock_data: Dict[str, pd.DataFrame]) -> None:
    objects = []
    for ticker in stock_data:
        db_class = StockModels[ticker]
        for index, row in stock_data[ticker].iterrows():
            obj = db_class(
                date=index.strftime("%Y-%m-%d"),
                price=row["price"],
                price_20ma=row["price_20ma"],
                price_50ma=row["price_50ma"],
                price_100ma=row["price_100ma"],
                price_200ma=row["price_200ma"],
                price_ratio_20ma=row["price_ratio_20ma"],
                price_ratio_50ma=row["price_ratio_50ma"],
                price_ratio_100ma=row["price_ratio_100ma"],
                price_ratio_200ma=row["price_ratio_200ma"],
                volume=math.log(max(1, row["volume"])),
            )
            objects.append(obj)

    db.session.add_all(objects)
    db.session.commit()


def initialize_tables():
    tickers_initialize = [
        ticker for ticker in StockModels if not table_exists(db.engine, ticker)
    ]
    if len(tickers_initialize) > 0:
        for ticker in tickers_initialize:
            StockModels[ticker].__table__.create(db.engine)
            data = stock_data(
                [ticker], start_date="1900-01-01", return_moving_average=True
            )
            save_to_database(data)


def remove_from_database(tickers_replace: List[str]):
    for ticker in tickers_replace:
        StockModels[ticker].__table__.drop(db.engine)
        StockModels[ticker].__table__.create(db.engine)


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
        db_class = StockModels[ticker]
        db_ordered_by_date = db_class.query.order_by(db_class.date.asc()).all()

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

                obj = db_class(
                    date=index.strftime("%Y-%m-%d"),
                    price=row["price"],
                    price_20ma=datum["price_20ma"],
                    price_50ma=datum["price_50ma"],
                    price_100ma=datum["price_100ma"],
                    price_200ma=datum["price_200ma"],
                    price_ratio_20ma=datum["price_ratio_20ma"],
                    price_ratio_50ma=datum["price_ratio_50ma"],
                    price_ratio_100ma=datum["price_ratio_100ma"],
                    price_ratio_200ma=datum["price_ratio_200ma"],
                    volume=math.log(max(1, row["volume"])),
                )
                objects.append(obj)

    db.session.add_all(objects)
    db.session.commit()

    return list(tickers_replace)


def update_database() -> None:
    now = datetime.now()
    start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    new_stock_data = all_stock_data(start_date, return_moving_average=False)
    tickers_replace = save_recent_data_to_database(new_stock_data)
    if len(tickers_replace) > 0:
        logger.info(f"Update Ticker at {now}: {tickers_replace}")
        remove_from_database(tickers_replace)
        updated_stock_data = stock_data(
            tickers_replace, "1990-01-01", return_moving_average=True
        )
        save_to_database(updated_stock_data)
