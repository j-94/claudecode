"""
Validates that a controller JSON output matches the expected shape constraints.
This is a lightweight shape checker for offline development.
"""
import json, sys, os
from typing import Dict, Any

REQUIRED_TOP_KEYS = {
  "PLAN_SUMMARY","RULE_SET_SCORES","TOOL_CALLS","META_UPDATES",
  "STATE_DELTA","CHILD_TASKS","TELEMETRY","CONFIDENCE","ANSWER"
}

def validate_shape(blob: Dict[str, Any]) -> None:
    missing = REQUIRED_TOP_KEYS - set(blob.keys())
    if missing:
        raise AssertionError(f"Missing keys: {sorted(missing)}")
    if not isinstance(blob["RULE_SET_SCORES"], list):
        raise AssertionError("RULE_SET_SCORES must be a list")
    if not isinstance(blob["TOOL_CALLS"], list):
        raise AssertionError("TOOL_CALLS must be a list")
    if not isinstance(blob["TELEMETRY"], list):
        raise AssertionError("TELEMETRY must be a list")
    # Shallow checks
    for call in blob["TOOL_CALLS"]:
        for k in ["tool","arguments","idempotency","simulated"]:
            if k not in call: raise AssertionError(f"TOOL_CALLS missing {k}")

def main():
    if sys.stdin.isatty():
        print("Paste controller JSON output, then Ctrl-D.\n")
    data = sys.stdin.read()
    blob = json.loads(data)
    validate_shape(blob)
    print("OK: shape valid.")

if __name__ == "__main__":
    main()
