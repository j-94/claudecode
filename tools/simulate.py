from typing import Dict, Any
from .validators import validate_tool_call

def run_tool(name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulated effects for offline testing. Validates schema then returns fake result.
    """
    validate_tool_call(name, args)
    if name == "SNAPSHOT":
        return {"ok": True, "note": args.get("note","")}
    if name == "PYTHON":
        return {"stdout":"<simulated python output>", "exit_code":0}
    if name == "WEB_SEARCH":
        return {"pages":[{"title":"Example","url":"https://example.org"}]}
    if name == "WRITE_FILE":
        return {"ok": True, "path": args.get("path","")}
    if name == "IMAGE_GEN":
        return {"image_id":"img_fake_123"}
    return {"ok": True}
