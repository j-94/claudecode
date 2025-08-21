from typing import Any, Dict, List

class LLMAdapter:
    """
    Vendor-agnostic interface for LLM tool orchestration.
    PURE interface: methods return structures; caller performs side-effects (network, IO).
    """

    def send(self, messages: List[Dict[str, Any]], tools: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Args:
          messages: provider-shaped messages (role, content, extra)
          tools: provider-shaped tool schemas
        Returns:
          provider raw response (dict)
        """
        raise NotImplementedError

    def extract_calls(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Parse provider response -> list of tool calls
        Each call: {"name": str, "arguments": dict, "id": str}
        """
        raise NotImplementedError

    def tool_result_msg(self, call_id: str, result: Any) -> Dict[str, Any]:
        """
        Encode a tool result as a provider-shaped message to continue the run loop.
        """
        raise NotImplementedError
