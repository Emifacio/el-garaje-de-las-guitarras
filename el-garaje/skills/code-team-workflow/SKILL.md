---
name: code-team-workflow
description: Use when a task should follow a structured architect-to-implementer-to-reviewer workflow. Triggers for multi-step feature work, refactors, or changes that benefit from explicit design before coding and a final review pass after implementation.
---

# Code Team Workflow

Use this skill when the user wants more than a quick patch and the work benefits from three explicit phases:

1. Architecture and scope definition
2. Implementation against that spec
3. Review against the spec and project conventions

Keep the interaction lightweight. Do not simulate separate agents unless that helps the user. Instead, work in clearly labeled phases and use the specialist references only when needed.

## Workflow

### 1. Architect

Before editing code:

- Read the relevant files and map existing patterns.
- Write a short plan that covers the problem, approach, files to change, interfaces, and risks.
- If the task is materially ambiguous or risky, pause and confirm before making irreversible choices.

For the detailed architect behavior, read [references/code-architect.md](references/code-architect.md).

### 2. Implement

After the design is clear:

- Read nearby files in the same layer or module.
- Implement only the scoped change.
- Match project conventions and keep comments sparse and useful.
- Run the narrowest meaningful verification available.

For the detailed implementer behavior, read [references/code-implementer.md](references/code-implementer.md).

### 3. Review

After implementation:

- Review against the spec first, then against correctness, security, and maintainability.
- Call out concrete issues with severity and file references.
- If there are no findings, say that explicitly and mention any remaining testing gaps or residual risk.

For the detailed reviewer behavior, read [references/code-reviewer.md](references/code-reviewer.md).

## Output Shape

Prefer this structure for substantial tasks:

- `Plan`: brief architectural summary before edits
- `Implementation`: what changed and any notable decisions
- `Review`: findings first, then verification status

For small tasks, compress the same workflow into short prose without ceremony.

## Guardrails

- Do not skip design on changes that touch multiple files, contracts, or data flow.
- Do not let implementation drift beyond the approved or inferred spec.
- Do not treat review as a summary; prioritize bugs, regressions, and missing validation.
- If tests are practical, run them. If not, say what you could not verify.
