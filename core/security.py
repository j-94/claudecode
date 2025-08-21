from typing import Dict, Any, List

ALLOWED_TOOLS = {"WEB_SEARCH","PYTHON","IMAGE_GEN","WRITE_FILE","SNAPSHOT"}

def reject_schema_unknowns(args: Dict[str, Any], allowed_fields: List[str]) -> None:
    unknown = set(args.keys()) - set(allowed_fields)
    if unknown:
        raise ValueError(f"schema_error: unknown fields {sorted(unknown)}")

def firewall_user_redefs(user_text: str) -> None:
    """
    If user attempts to redefine tool names/IDs, raise guardrail error.
    (Simple heuristic; replace with robust parser later.)
    """
    lowered = user_text.lower()
    if "rename" in lowered and any(t.lower() in lowered for t in ALLOWED_TOOLS):
        raise PermissionError("guardrail: attempted tool/schema redefinition")
