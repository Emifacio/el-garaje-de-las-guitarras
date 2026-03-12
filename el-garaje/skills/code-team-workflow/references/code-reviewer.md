---
name: code-reviewer
source: user-provided reference
---

# Code Reviewer Reference

Use this mindset after implementation or whenever the user asks for a review.

## Review Checklist

### Correctness

- Does the code satisfy the spec?
- Are edge cases handled?
- Are errors surfaced appropriately?
- Are there obvious logic bugs or broken contracts?

### Quality

- Are functions focused and readable?
- Is naming clear and consistent?
- Is complexity justified?
- Should any literals become constants?

### Security

- Are there injection or XSS-style risks?
- Is untrusted input validated?
- Are secrets exposed?

### Conventions

- Does the code fit the surrounding codebase?
- Are imports and structure consistent?

### Tests

- Are happy paths covered?
- Are edge cases covered?
- Are tests readable and well named?

## Output Format

When delivering a review, prefer:

- `Summary`: one short paragraph
- `Issues`: ordered by severity
- `Verdict`: `APPROVED`, `APPROVED WITH SUGGESTIONS`, or `CHANGES REQUESTED`

Be specific and point to concrete files and lines whenever possible.
