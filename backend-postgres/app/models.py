from datetime import datetime
from sqlalchemy import Index
from sqlalchemy.ext.declarative import declared_attr

from .extensions import db


class Stock(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now())
    modified_at = db.Column(db.DateTime, default=datetime.now())
    price = db.Column(db.Float, nullable=True)
    price_20ma = db.Column(db.Float, nullable=True)
    price_50ma = db.Column(db.Float, nullable=True)
    price_100ma = db.Column(db.Float, nullable=True)
    price_200ma = db.Column(db.Float, nullable=True)
    price_ratio_20ma = db.Column(db.Float, nullable=True)
    price_ratio_50ma = db.Column(db.Float, nullable=True)
    price_ratio_100ma = db.Column(db.Float, nullable=True)
    price_ratio_200ma = db.Column(db.Float, nullable=True)
    volume = db.Column(db.Float, nullable=True)

    @declared_attr
    def __table_args__(cls):
        index_name = f"idx_{cls.__tablename__}_date"  # Make index name unique per table
        return (Index(index_name, cls.date),)

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date,
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
