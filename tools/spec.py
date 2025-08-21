from typing import Dict, Any

# Tool API specification (minimal; align with controller contract)
SPEC: Dict[str, Dict[str, Any]] = {
    "WEB_SEARCH": {"args":["query","days"]},
    "PYTHON": {"args":["code"]},
    "IMAGE_GEN": {"args":["prompt"]},
    "WRITE_FILE": {"args":["path","content"]},
    "SNAPSHOT": {"args":["note"]},
}
