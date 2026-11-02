# Configure the model connection

Use this guide to connect the researcher to your chosen model provider and diagnose configuration errors.

Copy `.env.example` to `.env` and fill in real values. `.env` is ignored by Git.

All agents share one provider connection, and each agent picks its model by use case.

| Variable | Meaning |
| --- | --- |
| `MODEL_API_KEY` | Key for your model-provider account |
| `MODEL_BASE_URL` | Optional OpenAI-compatible API address |
| `RESEARCH_MODEL` | Required model in `provider/model-name` form |

Without a custom endpoint, an unset `MODEL_API_KEY` lets Mastra use the provider's standard key variable. With a custom endpoint, `MODEL_API_KEY` is required; there is no fallback.

`.env.example` also lists the model variables for agents not built yet (`REVIEW_MODEL`, `STRATEGY_MODEL`, `CATEGORIZATION_MODEL`), commented out. They take effect when their agents exist; an unset variable for an agent that does not exist yet is ignored.

Changing provider means changing these values; no code changes and no variable renames. Prefer a pinned model id over a "latest" alias, so answers do not change when the provider updates the alias.

## Choosing a model

| Connection | Choose when | Values to supply | Startup checks |
| --- | --- | --- | --- |
| Built-in provider | Mastra lists your provider | Model and key; leave base URL unset | Model format and registered provider |
| Custom endpoint | You need your own API address | Model, key, and base URL | Model format, HTTP(S) URL, and key presence |

Neither path checks account access or model availability until a prompt is sent.

Use a model name available in your provider account. For a provider built into Mastra, set `RESEARCH_MODEL` to `provider/model-name` and leave `MODEL_BASE_URL` unset.

For a custom endpoint (the provider's API address), set all three variables. It must accept OpenAI-compatible requests. For example, with `RESEARCH_MODEL=custom/team/model-name`, the endpoint receives `team/model-name`; `custom` is only a label. Use your provider's documented base URL and model name, not these placeholders.

All agents use the same key and optional endpoint. The model variable chooses which model each use case uses.

## Startup errors

| Error names | What to check |
| --- | --- |
| `RESEARCH_MODEL` | Set a nonempty `provider/model-name`. Without a custom endpoint, the provider must be in Mastra's registry. |
| `MODEL_BASE_URL` | Use a complete `http://` or `https://` URL. |
| `MODEL_API_KEY` | Supply a key when a custom endpoint is set. A keyless local server still needs a placeholder value. |

The startup check validates the provider, not whether your account can use the model. Authentication, model availability, and endpoint compatibility are checked when you send a prompt.

Providers in Mastra's installed registry, including `netlify` and `vercel`, pass the provider check. IDs routed through Mastra's own `mastra` gateway or a custom gateway are rejected; use an OpenAI-compatible `MODEL_BASE_URL` when available.

## Local run history

A trace is a record of an agent run. Studio stores traces in `mastra.db` at the project root, which Git ignores. To clear this history, stop Studio and delete that database; this removes the saved traces.

[Back to the README](../../README.md)
