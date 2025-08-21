from typing import Dict
from .types import State

MAX_DELTA = 0.2

def _clip01(x: float) -> float:
    return max(0.0, min(1.0, x))

def apply_meta_update(state: State, family: str, coeff_id: str, mode: str, value: float, decay_others: bool=False) -> None:
    """
    Clip to [0,1]; |Δ|<=0.2; optional decay of siblings (simple renorm).
    """
    fam = getattr(state, family).values
    before = fam.get(coeff_id, 0.0)
    if mode == "delta":
        target = before + value
    else:
        target = value
    # enforce delta limit
    if abs(target - before) > MAX_DELTA:
        target = before + MAX_DELTA if target > before else before - MAX_DELTA
    fam[coeff_id] = _clip01(target)
    if decay_others:
        # naive simplex renorm
        total = sum(fam.values())
        if total > 0:
            for k in fam:
                fam[k] = fam[k] / total
