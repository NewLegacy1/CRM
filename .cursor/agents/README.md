# Cursor subagents (this project)

**Global definitions** (all your Cursor workspaces):  
`%USERPROFILE%\.cursor\agents\`

- `research.md` — research before building
- `code-reviewer.md` — unbiased review, PASS/FAIL
- `qa.md` — Vitest / Testing Library tests and run reports

**Precedence:** Files in **this folder** (`.cursor/agents/*.md`) override the same `name` in `%USERPROFILE%\.cursor\agents\`.

If you still have a `.claude/agents/` folder from an old template, Cursor does not load it — your active subagents are `%USERPROFILE%\.cursor\agents\` and optional project overrides here.
