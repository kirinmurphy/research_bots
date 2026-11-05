---
id: 2h8oxb99
priority: medium
next_action: Create a five-video fixture set and a manual evaluation sheet comparing specialized and baseline outputs.
blocked_by: []
depends_on: ["y9gc5tc0"]
related: []
reviewed_commit:
worktree:
---

# Measure whether specialization improves research quality

## Summary

Make the first learning loop measurable: test whether specialized agents improve grounding, relevance, and decision usefulness without excessive cost.

## Context

Successful execution does not prove the research is good. A small repeated evaluation is enough to compare prompt changes, agent responsibilities, and model cost without building a dashboard.

## Goals

- Use fixed transcript inputs for repeatable evaluation.
- Score evidence grounding, missed themes, recommendation usefulness, and cost/latency.
- Record one change worth keeping and one not worth keeping.

## Non-goals

- Automated LLM judges, large benchmark suites, public leaderboards, or elaborate observability infrastructure.

## Proposed design

Store five intentionally varied text transcript fixtures under `tests/fixtures/transcripts/` (use excerpts that can be lawfully retained). Add `docs/evaluation-rubric.md` with four human-rated dimensions (0–2 each): source grounding, useful themes, actionable next exploration, and justified tool choice. Run each fixture through a baseline general agent and the specialized workflow with the same model settings; record runtime and token usage from available traces. Save results in a small Markdown table under `docs/evaluations/`.

Record the model setting of each run as the values of the use-case variables (`RESEARCH_MODEL`, and `STRATEGY_MODEL` when the strategist runs), using pinned model ids rather than "latest" aliases so repeated runs compare the same models.

## Implementation checklist

- [ ] Select five transcript fixtures spanning overlapping, contradictory, and shallow video topics.
- [ ] Write a short rubric and an evaluation results table template.
- [ ] Run baseline and specialized variants using the same model and input limits.
- [ ] Review misses and decide whether an identity, tool, or workflow change improves outcomes.

## Validation

- Each result row links to a fixture, the model/config used, and a trace or saved output.
- At least one known unsupported claim is penalized under grounding.
- A reviewer can compare two approaches and identify whether a quality gain justified extra execution.

## Risks

A five-video sample is directional, not a statistical benchmark; do not overinterpret small score changes.

## Learning focus

Learn to evaluate agent design decisions instead of judging only whether the agent produced plausible prose.

## Review checkpoint

Which specialization made a measurable difference, and what could you simplify without losing quality?

## Documentation impact

Create `docs/evaluation-rubric.md` and a small results table; link them from `README.md`.

## References

- <https://mastra.ai/docs/studio/overview>
