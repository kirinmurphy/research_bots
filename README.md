# research-bots

An experiment in specialized research agents. The first agent, the **Knowledge Researcher**, assesses claims about software technologies and separates claims, evidence, open questions, and recommendations. It runs locally in [Mastra Studio](https://mastra.ai/docs/studio/overview).

## Prerequisites

- Node.js 22.13 or later (`engines` in `package.json`).
- An API key for the model provider you choose (for example Z.ai, DeepSeek, or Anthropic).

Installed versions at setup:

| Package | Version |
| --- | --- |
| `@mastra/core` | 1.79.0 |
| `mastra` (CLI) | 1.35.0 |
| `@mastra/libsql` | 1.27.0 |
| `@mastra/observability` | 1.21.0 |

These were the newest releases allowed by an npm `min-release-age` of 7 days when the project was set up. Upgrade them together with `npm install @mastra/core@latest mastra@latest @mastra/libsql@latest @mastra/observability@latest`.

## Install

```bash
npm install
```

## Environment

Copy `.env.example` to `.env` and fill in real values. `.env` is ignored by Git.

| Variable | Meaning |
| --- | --- |
| `KNOWLEDGE_RESEARCHER_MODEL` | The researcher's model, as a Mastra model-router string `provider/model-name`. Required: startup fails with an error naming this variable when it is missing or malformed. |
| `KNOWLEDGE_RESEARCHER_API_KEY` | API key for whichever provider the model names. When unset, Mastra falls back to that provider's standard variable, such as `ZHIPU_API_KEY`. |

Changing provider means changing these two values; no code changes and no variable renames. Each agent has its own pair, so one agent can run on a cheap model while another uses a stronger one.

| Provider | Example model string |
| --- | --- |
| Z.ai (GLM) | `zai/glm-5.3-flash` |
| DeepSeek | `deepseek/deepseek-v4-flash` |
| Anthropic | `anthropic/claude-sonnet-5-5` |

## Run Studio

```bash
npm run dev
```

Studio opens at <http://localhost:4111>. The **Agents** page lists the Knowledge Researcher; its chat runs the agent, and **Traces** shows each run.

The agent's identity is `agents/knowledge-researcher/AGENT.md`. It is read once when the server starts, so **restart `npm run dev` after editing it**.

Studio stores traces in `mastra.db` at the project root (ignored by Git). Delete it to start fresh.

## Checks

```bash
npm run typecheck
npm test
```

Tests never call a model: the runner test uses Mastra's mock model.

## Agent layer

Application code talks to agents through a small, project-owned layer, so the agent framework can be replaced without rewriting domain code.

| Folder | Owns | Imports Mastra |
| --- | --- | --- |
| `agents/<agent-name>/AGENT.md` | Each agent's identity, as plain Markdown | — |
| `src/agents/` | Agent definitions (id, name, `AGENT.md` path, model variable), the `AgentRunner` interface, reading `AGENT.md`, resolving the model | No |
| `src/mastra/` | Building Mastra agents from definitions, the Mastra-backed `AgentRunner`, the `Mastra` instance with storage and tracing | Yes |

- `AgentRunner.generate(agentId, prompt)` resolves to the response text. Domain code receives an `AgentRunner` as a parameter, so its tests can pass a fake.
- To change frameworks, rewrite `src/mastra/`. `src/agents/` and domain code stay as they are.
- Mastra's Studio, workflows, tracing, memory, and model router are used directly from `src/mastra/`, not wrapped.

## Smoke test

Checks that the researcher's identity shapes its answers. The record lives in `docs/smoke-tests/knowledge-researcher-studio.md`.

1. Run `npm run dev` and open the Knowledge Researcher in Studio.
2. Submit this prompt in a new thread:

   ```text
   A video claims that Mastra workflows replace the need for a job queue. Assess this claim.
   ```

3. Record the date, Mastra version, model string, a response excerpt, and the trace ID from **Traces**.
4. Change one rule in `AGENT.md`, restart `npm run dev`, submit the same prompt in a new thread, and record how the response changed.
