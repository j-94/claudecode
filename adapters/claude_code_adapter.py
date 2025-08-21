from typing import Any, Dict, List
from .llm_adapter import LLMAdapter

class ClaudeCodeAdapter(LLMAdapter):
    """
    Claude Code v0 adapter (simulated). In real life, integrate Anthropic's API.
    """

    def send(self, messages: List[Dict[str, Any]], tools: List[Dict[str, Any]]) -> Dict[str, Any]:
        # Simulated content-only response. Extend with actual API call later.
        return {"content": "<simulated>", "tool_uses": []}

    def extract_calls(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        return response.get("tool_uses", [])

    def tool_result_msg(self, call_id: str, result: Any) -> Dict[str, Any]:
        return {"tool_result": {"tool_use_id": call_id, "content": result}}
