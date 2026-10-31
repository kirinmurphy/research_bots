---
id: ynkae8ky
priority: high
next_action: Persist validated VideoAnalysis records under knowledge/videos and prove they survive restarts.
blocked_by: []
depends_on: ["w6j1t8pq"]
related: []
reviewed_commit:
worktree:
---

# Keep research knowledge independent of agent memory

## Summary

Create a small durable knowledge base from structured video records, without introducing a database server or vector search.

## Context

Mastra memory is useful for agent conversations and runtime state. The application also needs framework-independent research evidence that can be inspected, versioned, and migrated.

## Goals

- Save and load a validated analysis by video ID.
- Reprocessing the same transcript does not duplicate records.
- Video research remains readable without running Mastra.

## Non-goals

- Embeddings, semantic search, graph databases, or fully autonomous knowledge merging.

## Proposed design

Use `knowledge/videos/<videoId>.json` as the canonical domain record, with a stable JSON schema in `src/research/video-analysis.ts`. Implement read/write operations in `src/knowledge/video-store.ts`. Writes are atomic (write to a sibling temporary file and rename). A record stores `transcriptHash` so unchanged inputs can be skipped; changed input requires an explicit refresh option. No Mastra types belong in the persisted schema.

Do not store raw downloaded transcripts in Git by default; keep them in the local cache. These records contain citations, excerpts, and summaries rather than the full transcript.

## Implementation checklist

- [ ] Create read/write/list functions for the validated video schema.
- [ ] Add duplicate detection by video ID and transcript hash, including explicit refresh behavior.
- [ ] Persist one fixture result, restart the process, and read it back.
- [ ] Document knowledge retention and Git tracking expectations.

## Validation

- Write/read round-trip preserves important fields and source links.
- Duplicate same-hash processing makes no new record and a changed hash requires explicit refresh.
- Records can be inspected with a text editor and loaded without Mastra.

## Risks

Avoid two sources of truth. Generated Markdown reports should be treated as derived views, not hand-edited canonical records.

## Learning focus

See the difference between conversation memory and a durable, portable domain knowledge base.

## Review checkpoint

Can you delete the runtime state and still explain what was learned from a video using its JSON record?

## Documentation impact

Describe `knowledge/videos/` as the research source of truth in `README.md`.

## References

- <https://mastra.ai/docs/storage>
