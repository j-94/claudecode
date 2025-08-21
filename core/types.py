from dataclasses import dataclass, field
from typing import Dict, List, Any

Score = float  # 0..1

@dataclass
class CoeffFamily:
    values: Dict[str, float] = field(default_factory=dict)

@dataclass
class State:
    tick: int
    goal: str
    alpha: CoeffFamily
    beta: CoeffFamily
    gamma: CoeffFamily
    budgets: Dict[str, Any]
    feedback: Dict[str, str]

@dataclass
class RuleSetScore:
    name: str
    validity: Score
    relevance: Score
    leverage: Score

@dataclass
class ToolCall:
    tool: str
    arguments: Dict[str, Any]
    idempotency: Dict[str, int]
    simulated: bool = True
