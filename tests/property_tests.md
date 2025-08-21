# Property Tests (Must-Hold)

1. **Schema strictness**: Unknown fields in tool args -> `schema_error`.
2. **Gamma gate**: γ(tool)<0.5 -> call is not emitted (plan-only).
3. **Idempotency**: duplicate {tick_id,call_idx} -> dedup in runtime.
4. **Budget exceeded**: cap < projected -> emit `BUDGET_EXCEEDED` and STOP.
5. **Guardrail**: user tries tool/schema rename -> `guardrail` not bypassed.
