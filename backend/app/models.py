from datetime import datetime

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
    log_volume = db.Column(db.Float, nullable=True)
    log_volume_20ma = db.Column(db.Float, nullable=True)
    log_volume_50ma = db.Column(db.Float, nullable=True)
    log_volume_100ma = db.Column(db.Float, nullable=True)
    log_volume_200ma = db.Column(db.Float, nullable=True)
    price_ratio_20ma = db.Column(db.Float, nullable=True)
    price_ratio_50ma = db.Column(db.Float, nullable=True)
    price_ratio_100ma = db.Column(db.Float, nullable=True)
    price_ratio_200ma = db.Column(db.Float, nullable=True)
    price_percentile_20ma = db.Column(db.Float, nullable=True)
    price_percentile_50ma = db.Column(db.Float, nullable=True)
    price_percentile_100ma = db.Column(db.Float, nullable=True)
    price_percentile_200ma = db.Column(db.Float, nullable=True)
    log_volume_ratio_20ma = db.Column(db.Float, nullable=True)
    log_volume_ratio_50ma = db.Column(db.Float, nullable=True)
    log_volume_ratio_100ma = db.Column(db.Float, nullable=True)
    log_volume_ratio_200ma = db.Column(db.Float, nullable=True)
    log_volume_percentile_20ma = db.Column(db.Float, nullable=True)
    log_volume_percentile_50ma = db.Column(db.Float, nullable=True)
    log_volume_percentile_100ma = db.Column(db.Float, nullable=True)
    log_volume_percentile_200ma = db.Column(db.Float, nullable=True)

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
            "log_volume": self.log_volume,
            "log_volume_20ma": self.log_volume_20ma,
            "log_volume_50ma": self.log_volume_50ma,
            "log_volume_100ma": self.log_volume_100ma,
            "log_volume_200ma": self.log_volume_200ma,
            "price_ratio_20ma": self.price_ratio_20ma,
            "price_ratio_50ma": self.price_ratio_50ma,
            "price_ratio_100ma": self.price_ratio_100ma,
            "price_ratio_200ma": self.price_ratio_200ma,
            "price_percentile_20ma": self.price_percentile_20ma,
            "price_percentile_50ma": self.price_percentile_50ma,
            "price_percentile_100ma": self.price_percentile_100ma,
            "price_percentile_200ma": self.price_percentile_200ma,
            "log_volume_ratio_20ma": self.log_volume_ratio_20ma,
            "log_volume_ratio_50ma": self.log_volume_ratio_50ma,
            "log_volume_ratio_100ma": self.log_volume_ratio_100ma,
            "log_volume_ratio_200ma": self.log_volume_ratio_200ma,
            "log_volume_percentile_20ma": self.log_volume_percentile_20ma,
            "log_volume_percentile_50ma": self.log_volume_percentile_50ma,
            "log_volume_percentile_100ma": self.log_volume_percentile_100ma,
            "log_volume_percentile_200ma": self.log_volume_percentile_200ma,
        }
