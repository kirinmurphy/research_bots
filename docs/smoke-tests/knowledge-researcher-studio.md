# Knowledge Researcher Studio smoke test

Steps are in the README's Smoke test section.

## Setup check — 2026-10-31

| Item | Value |
| --- | --- |
| Mastra | `@mastra/core` 1.79.0, `mastra` CLI 1.35.0 |
| Model string | `anthropic/claude-sonnet-5-5` |
| Agents listed in Studio | Knowledge Researcher only; no tools, workflows, or subagents |
| Instructions source | `GET /api/agents` returned `agents/knowledge-researcher/AGENT.md` as the agent's instructions under `mastra dev` |
| Missing model setting | Starting without `KNOWLEDGE_RESEARCHER_MODEL` stopped with `KNOWLEDGE_RESEARCHER_MODEL is not set. Set it to a Mastra model string (provider/model-name), for example in .env.` |

## Run 1 — original AGENT.md

Not yet run: no provider API key was available when the project was set up.

Prompt:

```text
A video claims that Mastra workflows replace the need for a job queue. Assess this claim.
```

- Date:
- Response excerpt:
- Trace ID:

## Run 2 — after editing one rule

Not yet run.

- Rule changed:
- Date:
- Response excerpt:
- Trace ID:
- Difference from run 1:
