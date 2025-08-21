from typing import Dict

def estimate_cost(prompt_len: int, plan_len: int, price_per_token: float, tool_costs: Dict[str,float], tools_planned) -> float:
    est_tokens = int(0.75 * (prompt_len + plan_len))
    est_usd = est_tokens * price_per_token
    for t in tools_planned:
        est_usd += tool_costs.get(t, 0.0)
    return est_usd
