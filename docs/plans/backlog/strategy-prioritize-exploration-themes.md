---
id: 1rgsneor
priority: medium
next_action: Build a report command that groups existing video themes and produces a transparent top-three exploration list.
blocked_by: []
depends_on: ["ynkae8ky"]
related: []
reviewed_commit:
worktree:
---

# Find recurring themes and rank what to explore next

## Summary

Turn accumulated findings into a reviewable list of recurring concepts and next investigations.

## Context

Individual video records are useful but do not answer what topics recur or deserve attention. Ranking must explain its reasons rather than manufacture confidence.

## Goals

- Group comparable theme labels across stored videos.
- Generate a top-three exploration report with source links and an explicit reason for each item.
- Keep the output reproducible from existing records.

## Non-goals

- Personalized recommendation models, embeddings, automatic actions, or claiming popularity equals best practice.

## Proposed design

Create `src/knowledge/summarize-themes.ts` that reads all video records, applies a small human-maintained theme-alias map, and generates `knowledge/reports/explore-next.md`. Start with a transparent score: number of distinct videos mentioning a theme plus number of unresolved questions; print both factors and link to sources. The ranking is a learning priority, not a claim that the theme is endorsed by industry. Keep the generated report derived; video JSON stays authoritative.

## Implementation checklist

- [ ] Define a tiny theme-alias map and normalization function with unit tests.
- [ ] Aggregate distinct video mentions and open questions for each canonical theme.
- [ ] Generate a Markdown report with three suggestions, supporting video URLs, and ranking inputs.
- [ ] Review sample results from three different fixture videos; refine only demonstrably confusing aliases.

## Validation

- The same fixture inputs produce exactly the same ranking and report.
- A duplicate record or repeated theme in one video does not inflate the distinct-video count.
- Every ranked suggestion shows its inputs and points to one or more underlying video records.

## Risks

A simple metric can prioritize repetition over usefulness. Make rankings explainable and subject to human review.

## Learning focus

Compare deterministic aggregation with agent-generated synthesis before adding more AI automation.

## Review checkpoint

Can you explain why the top-ranked theme outranks the second without asking the model?

## Documentation impact

Document the ranking formula and how to change theme aliases.
