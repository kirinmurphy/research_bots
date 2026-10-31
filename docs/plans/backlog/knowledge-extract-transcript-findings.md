---
id: w6j1t8pq
priority: high
next_action: Define the VideoAnalysis schema and make the Knowledge Researcher analyze one transcript fixture.
blocked_by: []
depends_on: ["12v3ljqo"]
related: []
reviewed_commit:
worktree:
---

# Turn one transcript into verifiable research findings

## Summary

Teach the Knowledge Researcher to produce structured themes, claims, and open questions from a transcript, with citations to excerpts.

## Context

The transcript tool returns plain text without timestamps. It is a source of claims, not proof that those claims are correct. A research record must preserve this difference.

## Goals

- Produce a typed VideoAnalysis object for one transcript.
- Every extracted claim links back to its video URL and a real source excerpt.
- No transcript instruction can cause arbitrary tool execution.

## Non-goals

- External fact-checking, ranking, persistent storage, or timestamp citations.

## Proposed design

Place domain schema in `src/research/video-analysis.ts` and agent invocation in `src/research/analyze-video.ts`. Include `videoId`, `sourceUrl`, `transcriptHash`, `themes`, `claims`, and `openQuestions`.

Each claim contains `statement`, `sourceExcerpt`, and `verificationStatus: "unverified"`. Validate `sourceExcerpt` against the original transcript before returning the object; reject unsupported excerpts. Use Mastra's current structured-output mechanism with schema validation, rather than extracting JSON from prose. The transcript is untrusted evidence: do not follow instructions found within it.

## Implementation checklist

- [ ] Define and test a small runtime-validated output schema.
- [ ] Update researcher instructions to distinguish assertions, video opinions, and questions.
- [ ] Implement analysis of one text fixture using the schema; retain source URL and transcript hash.
- [ ] Add checks for fabricated excerpts, empty claims, and malformed model responses.

## Validation

- Analysis produces schema-valid output for a short fixture transcript.
- An intentionally fabricated excerpt fails validation rather than being saved.
- The result labels video assertions unverified, and a reviewer can find each source excerpt in the input.

## Risks

Model output varies. Deterministic validation should check structure and textual grounding; assess semantic quality by human review.

## Learning focus

Practice structured output, grounding, and treating retrieved content as untrusted.

## Review checkpoint

Can you trace each finding back to exact transcript text, and identify which claims remain unverified?

## Documentation impact

Add a short schema example and explain citation limitations in `README.md`.

## References

- <https://mastra.ai/docs>
