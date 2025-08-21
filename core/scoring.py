from typing import List
from .types import RuleSetScore

def score_rule_sets(goal: str) -> List[RuleSetScore]:
    """
    Deterministic placeholder scoring based on goal keywords.
    This is PURE; replace with a proper heuristic later.
    """
    base = {
        "Analytic":   (0.72, 0.70, 0.60),
        "Analogical": (0.60, 0.62, 0.55),
        "Counterfactual": (0.33, 0.35, 0.40),
        "Divergent":  (0.45, 0.48, 0.65),
    }
    out = []
    for name, (v,r,l) in base.items():
        out.append(RuleSetScore(name=name, validity=v, relevance=r, leverage=l))
    return out
