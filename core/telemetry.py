import json, time
from typing import Optional, Dict, Any

def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

def log_event(tick: int, event: str, **kwargs) -> str:
    row: Dict[str, Any] = {"ts": now_iso(), "tick": tick, "event": event}
    row.update(kwargs)
    return json.dumps(row, ensure_ascii=False)
