# research-bots

Research software strategies, approaches, and patterns—including specific software when relevant—with specialized agents.

The first agent, **Knowledge Researcher**, assesses a claim and separates its answer into **Claims**, **Evidence**, **Open questions**, and **Recommendations**. It runs locally in Mastra Studio, a browser interface for chatting with agents and inspecting their runs.

## Get started

You need Node.js 22.13 or later and a model-provider account with an API key. From the project folder:

```bash
npm install
cp .env.example .env
```

Edit `.env` with your provider’s values:

- `MODEL_API_KEY`: your API key.
- `MODEL_BASE_URL`: your provider’s OpenAI-compatible API address; leave unset for a provider built into Mastra.
- `RESEARCH_MODEL`: the model to use, in `provider/model-name` form. Replace example placeholders with a model your account can access.

See [configuration help](docs/support/configuration.md) for provider options and startup errors. `.env` is ignored by Git.

```bash
npm run dev
```

Open [Studio](http://localhost:4111), choose **Agents → Knowledge Researcher**, and send a prompt. **Traces** shows records of agent runs.

## Try it

| Research goal | Example prompt |
| --- | --- |
| Assess a strategy | “A small team should start with a modular monolith rather than microservices. Assess this claim.” |
| Explore a pattern | “When does an event-driven approach help a research pipeline, and what tradeoffs does it introduce?” |
| Evaluate specific software | “A video claims that Mastra workflows replace the need for a job queue. Assess this claim.” |

Include your constraints and relevant source excerpts. The researcher currently has **no browsing or retrieval tools**; it cannot independently check current sources. Treat unsupported claims as unverified.

To change how it answers, edit [the researcher’s instructions](agents/knowledge-researcher/AGENT.md), then restart `npm run dev`. Instructions load when the server starts.

## Go further

- [Configure providers and troubleshoot startup](docs/support/configuration.md)
- [Verify instruction changes and traces](docs/support/verify-researcher.md)
- [Understand the architecture and add an agent](docs/internal/architecture.md)
- [Run development checks and builds](docs/internal/development.md)
