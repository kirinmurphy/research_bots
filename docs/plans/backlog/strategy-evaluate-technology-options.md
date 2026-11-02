---
id: pkxml601
priority: medium
next_action: Create a Technology Strategist agent that compares two named tools against documented decision criteria.
blocked_by: []
depends_on: ["ynkae8ky"]
related: []
reviewed_commit:
worktree:
---

# Compare technologies using current primary sources

## Summary

Introduce a second specialized agent that investigates technologies from the knowledge base and recommends when to adopt, prototype, monitor, or avoid them.

## Context

Videos often describe tools without verifying version changes, alternatives, maintenance, or integration cost. The strategist should verify these separately and preserve uncertainty.

## Goals

- Compare two named technologies against explicit requirements and current documentation.
- Attach URLs and retrieval dates to consequential claims.
- Produce an actionable build-versus-buy recommendation with tradeoffs.

## Non-goals

- Automated installations, purchasing services, editing RoboRepo, or bulk crawling the web.

## Proposed design

Add `agents/technology-strategist/AGENT.md` and its Mastra definition. Provide a bounded web search/fetch capability supported by the installed runtime; keep tool configuration separate from domain schema. Input includes the question, candidate technologies, and constraints. Output uses `src/research/technology-evaluation.ts` for criteria, source references, advantages, limitations, build/buy decision, and unverified items. Favor official docs and repositories, mark conflicting or stale sources, and emit "insufficient evidence" where appropriate.

Model: the strategist reads its model from `STRATEGY_MODEL` (planned: Qwen 3.7 Flash, for complex research and build-versus-buy questions) and reaches it through the shared provider connection, `MODEL_API_KEY` and the optional `MODEL_BASE_URL`, that the Knowledge Researcher already uses. Add no per-agent key or endpoint variables; uncomment `STRATEGY_MODEL` in `.env.example` and describe it in the README.

## Implementation checklist

- [ ] Define strategist identity and structured evaluation schema.
- [ ] Connect one web search/fetch mechanism and document required provider configuration.
- [ ] Evaluate Mastra versus OpenAI Agents SDK for one concrete research criterion.
- [ ] Inspect cited source pages manually and correct any fabricated or outdated claims.

## Validation

- A two-tool comparison includes official source URLs, source dates, criteria, and a conditional recommendation.
- Missing or failed search results produce explicit uncertainty, not invented citations.
- The strategist performs no local writes or shell commands during its evaluation.

## Risks

Web sources and APIs change. Use provider-supported tools for the installed version and do not claim every fetched document is current.

## Learning focus

Separate evidence gathering from an agent’s judgment, and see how tool access changes agent behavior.

## Review checkpoint

Which part of the recommendation is fact, which part is a tradeoff, and what evidence could change it?

## Documentation impact

Document the research evidence rules and provider requirements in `README.md`.

## References

- <https://mastra.ai/docs/guides/overview>
- <https://openai.github.io/openai-agents-js/>
