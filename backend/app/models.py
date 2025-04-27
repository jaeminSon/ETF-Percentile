from datetime import datetime
from sqlalchemy import Index

from .extensions import db


class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now())
    modified_at = db.Column(db.DateTime, default=datetime.now())
    ticker = db.Column(db.String(10), nullable=False)
    price = db.Column(db.Float, nullable=True)
    price_20ma = db.Column(db.Float, nullable=True)
    price_50ma = db.Column(db.Float, nullable=True)
    price_100ma = db.Column(db.Float, nullable=True)
    price_200ma = db.Column(db.Float, nullable=True)
    price_ratio_20ma = db.Column(db.Float, nullable=True)
    price_ratio_50ma = db.Column(db.Float, nullable=True)
    price_ratio_100ma = db.Column(db.Float, nullable=True)
    price_ratio_200ma = db.Column(db.Float, nullable=True)
    volume = db.Column(db.Integer, nullable=True)

    __table_args__ = (
        Index('idx_ticker', 'ticker'),
        Index('idx_date', 'date'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date,
            "ticker": self.ticker,
            "price": self.price,
            "price_20ma": self.price_20ma,
            "price_50ma": self.price_50ma,
            "price_100ma": self.price_100ma,
            "price_200ma": self.price_200ma,
            "price_ratio_20ma": self.price_ratio_20ma,
            "price_ratio_50ma": self.price_ratio_50ma,
            "price_ratio_100ma": self.price_ratio_100ma,
            "price_ratio_200ma": self.price_ratio_200ma,
            "volume": self.volume,
        }
