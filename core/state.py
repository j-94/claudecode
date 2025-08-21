from typing import Dict, Any
from .types import State, CoeffFamily

DEFAULT_BUDGETS: Dict[str, Any] = {
    "tokens_turn": 3000,
    "tokens_session": 16000,
    "usd_cap": 0.10,
    "tool_cost": {"WEB_SEARCH":0.001,"PYTHON":0.002,"IMAGE_GEN":0.020,"WRITE_FILE":0.001,"SNAPSHOT":0}
}

def default_state(goal: str) -> State:
    return State(
        tick=0,
        goal=goal,
        alpha=CoeffFamily({"observe_vs_act":0.6, "converge_vs_diverge":0.55}),
        beta=CoeffFamily({"sequence_analysis":0.6,"causal_inference":0.55,"architectural_synthesis":0.5,"formal_modeling":0.4,"iterative_prototyping":0.3}),
        gamma=CoeffFamily({"documentation_parser":0.8,"python_code_interpreter":0.5,"state_vector_manager":0.6}),
        budgets=DEFAULT_BUDGETS.copy(),
        feedback={"progress":"","blockers":""}
    )
