from flask import Flask

from config import Config
from app.routes import main
from app.extensions import db

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
app.register_blueprint(main)

if __name__ == "__main__":
    app.run(debug=True)
