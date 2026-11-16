import os
import logging

home_log = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(home_log, "backend.log")),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger(__name__)
