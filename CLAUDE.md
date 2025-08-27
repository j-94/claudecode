# CLAUDE Instructions for claudecode

This repository hosts the extracted source for the Claude Code CLI (research preview).
The notes below encode heuristics from experienced Anthropic CLI users.

## Workflow
- **Explore → Plan → Code → Commit**
  - Read relevant files and outline a plan before editing.
  - Keep diffs minimal and confined to the needed files.
- **TDD bias**
  - Add or adjust tests first when behavior changes.
  - Run `npm test` (none defined yet) or `node cli.mjs --help` as a sanity check.
- **Commit discipline**
  - Use `git status` and `git diff` to review.
  - Commit with concise scope and rationale.
- **Permissions & safety**
  - Auto-Accept off by default; confirm before network or file writes.
  - Avoid modifying generated assets in `vendor/` unless explicitly tasked.
- **Context hygiene**
  - Start new tasks with a brief recap of goal and files.
  - Use checklists or scratch files for multi-step work.

These heuristics help keep interactions deterministic, auditable, and cost‑efficient.
