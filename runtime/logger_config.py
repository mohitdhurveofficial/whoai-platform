import logging
import sys


LOG_FORMAT = (
    "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)


def setup_logging() -> logging.Logger:
    """Configure application logging and return the app logger."""

    logging.basicConfig(
        level=logging.INFO,
        format=LOG_FORMAT,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    app_logger = logging.getLogger("whoai")
    app_logger.setLevel(logging.INFO)
    app_logger.propagate = False

    if not app_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(LOG_FORMAT))
        app_logger.addHandler(handler)

    return app_logger


logger = setup_logging()