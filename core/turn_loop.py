from typing import Dict, Any, List
from .types import State, ToolCall
from .scoring import score_rule_sets
from .policy import apply_meta_update
from .budget import estimate_cost
from .telemetry import log_event

PRICE_PER_TOKEN = 0.000002  # placeholder

def _prune(scores, threshold=0.4):
    return [s for s in scores if min(s.validity, s.relevance, s.leverage) >= threshold]

def run_tick(state: State, user_text: str="") -> Dict[str, Any]:
    """
    Deterministic tick:
      - score rule sets
      - prune < 0.4
      - synthesize compact plan
      - emit ≤3 meta updates + exactly 1 propose_action
      - budget check; possibly BUDGET_EXCEEDED
    Returns an object that matches the OUTPUT CONTRACT shape (skeleton values).
    """
    tick_id = state.tick + 1
    scores_all = score_rule_sets(state.goal)
    kept = _prune(scores_all, 0.4)

    plan = "1) Impl adapters; 2) Tests(golden+property); 3) Docs(PR+README); 4) Runner(validate traces)."
    tools_planned = ["SNAPSHOT"]  # keep cheap by default

    est_usd = estimate_cost(len(state.goal), len(plan), PRICE_PER_TOKEN, state.budgets["tool_cost"], tools_planned)
    telemetry = [log_event(tick_id, "start", goal_sha="<sha256>", state={"alpha":state.alpha.values, "beta":state.beta.values, "gamma":state.gamma.values})]

    # meta updates (example)
    apply_meta_update(state, "beta", "formal_modeling", mode="delta", value=0.2, decay_others=True)
    apply_meta_update(state, "gamma", "documentation_parser", mode="target", value=1.0, decay_others=False)
    apply_meta_update(state, "alpha", "observe_vs_act", mode="target", value=0.65, decay_others=False)

    meta_updates = [
        {"tool":"adjust_beta","arguments":{"id":"formal_modeling","mode":"delta","value":0.2,"decay_others":True,"rationale":"schema-strict artifacts"}},
        {"tool":"adjust_gamma","arguments":{"id":"documentation_parser","mode":"target","value":1.0,"rationale":"parser hot"}},
        {"tool":"adjust_alpha","arguments":{"id":"observe_vs_act","mode":"target","value":0.65,"rationale":"slight action lean"}}
    ]
    for mu in meta_updates:
        telemetry.append(log_event(tick_id, "meta_update", tool=mu["tool"], args=mu["arguments"]))

    # propose action (snapshot note)
    tool_calls: List[ToolCall] = [
        ToolCall(tool="SNAPSHOT", arguments={"note":"Emit CHILD_TASKS and spawn worker chats."}, idempotency={"tick_id":tick_id,"call_idx":0}, simulated=True)
    ]

    # Budget check
    if est_usd > state.budgets["usd_cap"]:
        telemetry.append(log_event(tick_id, "finish", success=False, tokens=0, usd=est_usd, failure_type="budget_exceeded"))
        return {
            "PLAN_SUMMARY": plan,
            "RULE_SET_SCORES": [s.__dict__ for s in scores_all],
            "TOOL_CALLS": [],
            "META_UPDATES": meta_updates,
            "STATE_DELTA": {"alpha":state.alpha.values,"beta":state.beta.values,"gamma":state.gamma.values},
            "CHILD_TASKS": [],
            "TELEMETRY": telemetry,
            "CONFIDENCE": {"p_conf_overall":0.85,"drivers":["deterministic loop"],"risks":["cap too low"]},
            "ANSWER": "BUDGET_EXCEEDED"
        }

    telemetry.append(log_event(tick_id, "action", name="snapshot", args=tool_calls[0].arguments))
    telemetry.append(log_event(tick_id, "finish", success=True, tokens=1800, usd=est_usd, top_score=0.71))

    # child tasks
    child_tasks = [
      {"id":"T1","lane":"impl","plan":"Implement adapters","lockset":["adapters/*"]},
      {"id":"T2","lane":"tests","plan":"Golden traces + properties","lockset":["tests/*"]},
      {"id":"T3","lane":"docs","plan":"PR template + README","lockset":[".github/*","README.md"]},
      {"id":"T4","lane":"impl","plan":"Runner to validate traces","lockset":["runner/*"]}
    ]

    state.tick = tick_id
    return {
        "PLAN_SUMMARY": plan,
        "RULE_SET_SCORES": [s.__dict__ for s in scores_all],
        "TOOL_CALLS": [tc.__dict__ for tc in tool_calls],
        "META_UPDATES": meta_updates,
        "STATE_DELTA": {"alpha":state.alpha.values,"beta":state.beta.values,"gamma":state.gamma.values},
        "CHILD_TASKS": child_tasks,
        "TELEMETRY": telemetry,
        "CONFIDENCE": {"p_conf_overall":0.90,"drivers":["deterministic loop","gamma gate","golden traces"],"risks":["chat-only effects"]},
        "ANSWER": ""
    }
