from flask import Flask
from flask_cors import CORS

from config import Config
from app.routes import main
from app.extensions import db

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)
db.init_app(app)
app.register_blueprint(main)

if __name__ == "__main__":
    app.run(debug=True)
