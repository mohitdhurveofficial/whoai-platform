import json
from pathlib import Path


LOG_DIR = Path("app/logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "runtime_logs.json"


def log_runtime_decision(data):

    logs = []

    if LOG_FILE.exists():
        try:
            logs = json.loads(LOG_FILE.read_text())
        except Exception:
            logs = []

    logs.append(data)

    LOG_FILE.write_text(
        json.dumps(logs, indent=2)
    )