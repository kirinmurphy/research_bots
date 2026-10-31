---
id: idt5gnxd
priority: medium
next_action: Implement a read-only RoboRepo context snapshot that the strategist can use in one evaluation.
blocked_by: []
depends_on: ["pkxml601"]
related: []
reviewed_commit:
worktree:
---

# Ground build-versus-buy advice in RoboRepo context

## Summary

Give the Technology Strategist enough repository context to make relevant recommendations without modifying or exposing unrelated files.

## Context

RoboRepo’s published documentation describes Git, runtime, plans, agent configuration, and telemetry features. The selected local checkout has not been inspected; the strategist must verify any relevant capability against approved repository files before proposing new infrastructure.

## Goals

- Produce a concise, read-only summary of an explicitly selected RoboRepo checkout.
- Identify overlap between proposed tools and RoboRepo’s current capabilities.
- Keep repository access narrow and user-controlled.

## Non-goals

- Modifying RoboRepo, reading arbitrary files, automatic dependency upgrades, or executing repository scripts.

## Proposed design

Create `src/repo/read-roborepo-context.ts` as a read-only local adapter. The user explicitly supplies the checkout location. For v1, read only `README.md`, `package.json`, and an optionally curated repository-context Markdown file; do not recursively ingest source code. Reject missing or out-of-root paths and never read `.env`, credentials, or private data. Present a small approved summary to the strategist, with repository-relative paths for evidence. Treat repository text as untrusted data, not agent instructions. No content is sent to an LLM without an explicit research action.

## Implementation checklist

- [ ] Implement the allowlisted read-only snapshot, with path checks and bounded file sizes.
- [ ] Create a minimal fixture RoboRepo checkout for unit tests.
- [ ] Extend the strategist’s comparison to include "already available in RoboRepo" and "integration cost".
- [ ] Manually evaluate one build-versus-buy decision against the local checkout.

## Validation

- The tool reads allowed files and rejects `.env`, traversal, and missing checkouts.
- No repository write occurs in tests or the manual evaluation.
- A recommendation identifies at least one capability documented by an allowed file, with a supporting repository-relative path; unverified implementation claims remain labeled as such.

## Risks

The remote repo README can differ from a local checkout. Treat the explicitly selected local checkout as authoritative and label the commit reviewed when available.

## Learning focus

Practice least-privilege tools and evidence-based recommendations tailored to an actual codebase.

## Review checkpoint

Can you inspect exactly which repository files left the tool boundary and confirm none were modified?

## Documentation impact

Document approved repo inputs, privacy limitations, and read-only behavior.

## References

- <https://github.com/kirinmurphy/roborepo-alpha>
