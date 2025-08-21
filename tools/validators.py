from typing import Dict, Any
from .spec import SPEC

def validate_tool_call(name: str, args: Dict[str, Any]) -> None:
    if name not in SPEC:
        raise ValueError(f"schema_error: unknown tool {name}")
    allowed = set(SPEC[name]["args"])
    unknown = set(args.keys()) - allowed
    if unknown:
        raise ValueError(f"schema_error: unknown fields {sorted(unknown)}")
