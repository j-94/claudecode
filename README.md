# Codex Meta-Controller (FP • α/β/γ • Vendor-Agnostic)

This repo scaffolds a deterministic, auditable meta-controller for LLM agents.
- **Functional core, imperative shell**: planning is pure; tools are effects.
- **Meta-controller α/β/γ**: α = stance (observe↔act), β = cognitive skills, γ = tool gates.
- **Output contract**: strict JSON blocks for PLAN, TOOL_CALLS, META_UPDATES, STATE_DELTA, CHILD_TASKS, TELEMETRY, CONFIDENCE, ANSWER.
- **Security**: schema-strict args, prompt-injection firewall, WRITE_FILE jail (conceptual here).

## Quick Start
1) Read `TaskGraph.yaml` to see lanes & tasks.
2) Run the stub validator: `python runner/validate_golden_traces.py`
3) Use `runner/simulate_controller_tick.py` to print a sample controller output.

## Layout
- `core/` – state models, policies, turn loop, telemetry, security
- `adapters/` – LLM adapters (stubs)
- `tools/` – tool specs, validators, simulator
- `tests/` – golden traces & properties
- `runner/` – minimal validators/simulators
- `.github/` – PR template
- `TaskGraph.yaml` – lanes & outputs

See `tests/property_tests.md` for non-negotiable properties.

