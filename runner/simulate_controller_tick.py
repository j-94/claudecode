"""
Runs core.turn_loop.run_tick() with default state and prints the JSON blob.
"""
import json
from core.state import default_state
from core.turn_loop import run_tick

def main():
    st = default_state("Stand up adapters, tests, docs, runner")
    out = run_tick(st, user_text="")
    print(json.dumps(out, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
