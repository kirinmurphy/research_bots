---
id: io239qp2
priority: none
next_action: Add a provider key to .env, run the fixed smoke-test prompt in Studio before and after one AGENT.md edit, and fill in docs/smoke-tests/knowledge-researcher-studio.md.
blocked_by: []
depends_on: []
related: ["12v3ljqo", "w6j1t8pq", "pkxml601", "y9gc5tc0"]
reviewed_commit:
worktree: agents-specialized-researcher-mastra-studio
---

# Run one specialized researcher in Mastra Studio

## Summary

Create a small, standalone TypeScript application with one named Knowledge Researcher agent, and run it in Mastra Studio. Its identity lives in an ordinary Markdown file that is easy to inspect and edit. A thin, project-owned agent layer sits between application code and Mastra, so the agent framework can be replaced later without rewriting domain code.

## Context

This repository is a new experiment, separate from RoboRepo and youtube-transcript-cli. Mastra is the initial agent runtime, but the project owns its agent instructions, agent definitions, and domain types.

Current state of the repository:

- It contains plan documents under `docs/plans/` and a `.gitignore` that ignores `.DS_Store`. There is no `package.json`, source code, README, or test setup.
- No agent application has been run locally.

This plan is the root of the backlog. Later plans build on what it creates:

| Later plan | Relies on from this plan |
| --- | --- |
| Use the existing YouTube CLI as a safe transcript tool (`12v3ljqo`) | `src/` layout, `README.md`, a working test command |
| Turn one transcript into verifiable research findings (`w6j1t8pq`) | `agents/knowledge-researcher/AGENT.md`, and the `AgentRunner` boundary for calling the researcher |
| Compare technologies using current primary sources (`pkxml601`) | The `agents/<agent-name>/AGENT.md` convention and the agent definition shape for a second agent |
| Coordinate two agents with an explicit review gate (`y9gc5tc0`) | `src/mastra/` as the only place that imports Mastra |

## Goals

- A local Studio session lists a Knowledge Researcher whose answers are visibly shaped by its identity, not a general assistant.
- The agent instructions live in `agents/knowledge-researcher/AGENT.md`, not inside framework configuration.
- Application code calls agents through a project-owned `AgentRunner` interface; only `src/mastra/` imports Mastra.
- The repository has working `typecheck` and `test` scripts that later plans extend.

## Non-goals

- Transcript processing, persistence, multi-agent execution, or a custom web interface.
- Agent tools of any kind, including shell, filesystem, or web access.
- Agent memory or conversation storage beyond what Studio needs to show traces.
- Wrapping Mastra's Studio, workflows, tracing, memory, or model router. Those stay Mastra-specific.
- A second runner implementation. The layer is shaped for one, but only the Mastra runner is built.

## Proposed design

### Two kinds of provider switch

| Switch | Handled by | Cost of switching |
| --- | --- | --- |
| Model provider (for example Anthropic to OpenAI) | Mastra's model router, reading a `provider/model-name` string | Change `KNOWLEDGE_RESEARCHER_MODEL` and the provider key |
| Agent framework (for example Mastra to another SDK) | The thin agent layer in this plan | Rewrite `src/mastra/` and any workflows; `src/agents/` and domain code stay unchanged |

### Ownership boundary

```mermaid
flowchart LR
  A[Domain code in later plans] -->|calls| B[AgentRunner interface in src/agents]
  C[src/mastra/mastra-agent-runner.ts] -->|implements| B
  C -->|delegates generation to| D[Mastra agent registry]
  E[Agent definitions in src/agents] -->|describe agents for| F[src/mastra agent builders]
  F -->|register agents in| D
  D -->|served by mastra dev| G[Studio at localhost:4111]
```

| Area | Owns | May import Mastra |
| --- | --- | --- |
| `src/agents/` | Agent definitions, the `AgentRunner` type, reading `AGENT.md`, resolving the model setting | No |
| `src/mastra/` | Turning definitions into Mastra agents, the Mastra-backed runner, the `Mastra` instance | Yes |
| Domain code (later plans) | Transcripts, research, knowledge | No; it receives an `AgentRunner` as a parameter |

The layer stays thin:

- `AgentRunner` has one method: `generate(agentId, prompt)` returning the response text. Later plans add options (such as a structured-output schema) only when they need them.
- The Mastra runner delegates directly to `mastra.getAgentById(...)` and the agent's generate call. It translates arguments and results; it does not reimplement retries, streaming, memory, or tracing.
- Domain code receives the runner as a parameter, so its tests can pass a fake runner and never call a model.

### Project layout

Files this plan creates or changes:

```text
package.json
package-lock.json
tsconfig.json
.gitignore                                  (extended; it exists already)
.env.example
README.md
agents/knowledge-researcher/AGENT.md
src/agents/definitions.ts
src/agents/agent-runner.ts
src/agents/instructions.ts
src/agents/instructions.test.ts
src/mastra/index.ts
src/mastra/agents/knowledge-researcher.ts
src/mastra/mastra-agent-runner.ts
src/mastra/mastra-agent-runner.test.ts
docs/smoke-tests/knowledge-researcher-studio.md
```

The scaffold may add further files (for example storage or observability setup in `src/mastra/index.ts`). Keep what Studio needs to show traces; remove example agents, tools, and workflows.

### Agent definitions and instructions

- `src/agents/definitions.ts` lists each agent as plain data: `id`, `name`, the repository-relative path to its `AGENT.md`, and the environment variable that holds its model string.
- `src/agents/instructions.ts` reads an agent's `AGENT.md` and resolves its model string. Both take explicit inputs (path, environment) so tests need no provider key.
- Instructions are read once when the agent is built. An edit to `AGENT.md` takes effect after restarting `mastra dev`; the README states this.
- Resolve the `AGENT.md` path from the project root, not from the compiled module's location. `mastra dev` bundles source into a build directory, so a path relative to the module file can break.

### Identity content

`AGENT.md` is short and tells the researcher to separate four kinds of output: claims, the evidence for each claim, open questions, and recommendations. It says that unsupported statements are labeled as unverified rather than asserted.

### Model configuration

The model is a Mastra model-router string (`provider/model-name`) read from the `KNOWLEDGE_RESEARCHER_MODEL` environment variable. The provider key uses Mastra's standard variable for that provider (for example `ANTHROPIC_API_KEY`). A missing model setting fails at startup with an error that names the variable. No keys appear in source or in `.env.example`.

### Tooling decisions

| Choice | Decision |
| --- | --- |
| Package manager | npm, with `package-lock.json` committed |
| Scaffold location | Repository root; `create mastra` makes a new directory, so scaffold there and move the files up |
| Test runner | Vitest, run by `npm test`; tests never call a model |
| Typecheck | `npm run typecheck` running `tsc --noEmit` |
| Ignored files | Add `.env`, `node_modules/`, and Mastra build output to the existing `.gitignore`; keep its `.DS_Store` entry |

### Reconciliation with the orchestration plan

The orchestration plan (`y9gc5tc0`) says not to create a universal runtime adapter, and to isolate Mastra-specific composition in `src/mastra/workflows/`. This plan stays within that rule: `AgentRunner` covers single agent calls only, and workflows remain Mastra-specific under `src/mastra/`. When that plan is promoted, its domain steps should call agents through `AgentRunner`; its text needs no change now.

## Implementation checklist

- [x] Scaffold a TypeScript Mastra project with `npm create mastra@latest`, move it to the repository root, and record the installed Mastra package versions and Node requirement in `README.md`.
- [x] Remove the scaffold's example agents, tools, and workflows so the Knowledge Researcher is the only registered agent and has no tools.
- [x] Extend `.gitignore`; add `typecheck` and `test` (Vitest) scripts; confirm both run on the empty project.
- [x] Create `src/agents/` with the agent definition, the `AgentRunner` type, and the instruction and model loaders, with no Mastra imports.
- [x] Write `agents/knowledge-researcher/AGENT.md`; build and register the Mastra agent from its definition in `src/mastra/`.
- [x] Implement the Mastra-backed `AgentRunner` as a direct delegation to the registered agent.
- [x] Add `.env.example` listing `KNOWLEDGE_RESEARCHER_MODEL` and the provider key name with placeholder values.
- [x] Add the Vitest tests listed under Validation.
- [ ] (Blocked: provider API key) Start Studio with `npm run dev`, submit the fixed prompt below, and record the result in `docs/smoke-tests/knowledge-researcher-studio.md`.
- [ ] (Blocked: provider API key) Edit one rule in `AGENT.md`, restart, resubmit the same prompt, and record the difference in the same file.
- [x] Write the README setup, environment, agent-layer, and smoke-test sections.

Fixed smoke-test prompt:

```text
A video claims that Mastra workflows replace the need for a job queue. Assess this claim.
```

The smoke-test record lists the date, Mastra version, model string, the prompt, a response excerpt, and the Studio trace ID or a screenshot of the trace.

## Validation

| Check | How it is verified |
| --- | --- |
| Instructions come from `AGENT.md` | Vitest: the instruction loader returns a fixture file's text, and two different fixture files produce two different results |
| Missing model fails clearly | Vitest: resolving the model without `KNOWLEDGE_RESEARCHER_MODEL` throws an error naming the variable |
| Runner delegates to Mastra | Vitest: the Mastra runner, given a `Mastra` instance whose agent returns a canned response, returns that text for the agent's id and rejects an unknown id; no model is called |
| `src/agents/` is framework-free | `grep -rn "@mastra" src/agents` prints nothing |
| Editing `AGENT.md` changes the agent | Manual: the before/after smoke-test responses differ |
| Studio lists the researcher | Manual: `npm run dev` shows Knowledge Researcher as the only agent, with no tools |
| A run produces a trace | Manual: the smoke-test record includes a trace ID or screenshot |
| Project health | `npm run typecheck` and `npm test` pass |
| No secrets committed | `git status` shows `.env` ignored; `.env.example` holds placeholders only |

## Risks

- Framework APIs change between releases. Verify the installed Mastra version's docs before implementing, and do not copy older examples.
- The default scaffold may wire in tools such as shell or web access. Remove them; the researcher has no tools in this plan.
- `mastra dev` runs bundled output. If reading `AGENT.md` from the project root fails under `mastra dev`, record the cause and the chosen fix in the decision log.
- Studio trace display may need storage or observability settings from the scaffold. Keep the minimum that shows a trace.
- An agent layer can grow into a second framework. Add a runner option only when a plan needs it, and keep anything Mastra already does on the Mastra side.
- Stubbing the agent's response in the runner test depends on the installed Mastra version. If the agent cannot be given a canned response without a network call, record the approach used in the decision log.

## Learning focus

Understand an agent identity, model configuration, a run, and a trace before introducing orchestration, and see where the project's code ends and the framework begins.

## Review checkpoint

Can you show how changing only `AGENT.md` changes the agent's response to the same prompt, and point to the one folder you would rewrite to change frameworks?

## Documentation impact

- Create `README.md` with prerequisites (Node version), installation, environment variables, the Studio start command, the restart-after-editing-`AGENT.md` note, the agent-layer boundary (`src/agents/` versus `src/mastra/`), and the smoke-test steps.
- Create `docs/smoke-tests/knowledge-researcher-studio.md` with the recorded smoke-test result.

## Decision log

- 2026-10-31: npm, Vitest, and a root-level scaffold chosen so later plans inherit one test command and layout.
- 2026-10-31: Instructions load once at agent initialization; a restart picks up `AGENT.md` edits.
- 2026-10-31: Model set by `KNOWLEDGE_RESEARCHER_MODEL` as a Mastra model-router string; no default model is hard-coded.
- 2026-10-31: A thin `AgentRunner` interface and framework-free agent definitions in `src/agents/` keep the agent framework replaceable. The user chose this over definitions-only so domain code can be tested with a fake runner.

- 2026-10-31: Mastra installed at the newest releases older than 7 days (`@mastra/core` 1.79.0, `mastra` 1.35.0, `@mastra/libsql` 1.27.0, `@mastra/observability` 1.21.0) because npm's `min-release-age = 7` refuses the 1.81.0 the scaffold pins. User decision: install the newest allowed versions and upgrade later rather than bypass the age gate.
- 2026-10-31: Scaffolded with `create-mastra --empty --no-install` rather than the default template. The default template's install fails under the age gate and brings example agents and tools that this plan removes; the empty scaffold has none. User approved.
- 2026-10-31: Project root found by walking up from the working directory to the nearest folder with both `package.json` and `agents/`. Observed under `mastra dev`: the working directory is `src/mastra/public` and the bundle runs from `.mastra/output`, which has its own `package.json`, so neither a module-relative path nor `package.json` alone finds the root. Alternatives: module-relative path (breaks under bundling), an explicit env variable (one more setting to get wrong).
- 2026-10-31: Studio traces use LibSQL storage at `<project root>/mastra.db` plus `Observability` with `MastraStorageExporter` and `SensitiveDataFilter`. Mastra's quickstart also adds DuckDB, which only adds metrics; the platform exporter sends data off-machine. Both left out as beyond the minimum.
- 2026-10-31: The runner test stubs the model with Mastra's own `createMockModel` from `@mastra/core/test-utils/llm-mock` (v2), registered on a real `Mastra` instance, so the delegation runs end to end with no network call.
- 2026-10-31: `tsconfig.json` lists `"types": ["node"]`; TypeScript 6 no longer includes `@types/node` automatically.

## Open Questions

- **No provider API key available for the live smoke test.** No `ANTHROPIC_API_KEY` (or other provider key) is set in this environment, and keys are entered only by the user. Blocks: the two smoke-test runs (before and after an `AGENT.md` edit) and the trace evidence in `docs/smoke-tests/knowledge-researcher-studio.md`. Resolution: add a key to `.env` and run the README's Smoke test steps; no code change is expected.

## Not tested

- [ ] Editing `AGENT.md` changes the researcher's answer to the fixed prompt. Needs two live model calls in Studio with a provider key.
- [ ] A Studio run produces a trace that is visible under Traces. Storage and the exporter are configured, but no model call has run.

## Review

### Findings

- [x] The unknown-agent runner test accepted any rejection; it now asserts the error names the missing id — fixed (5dbaca8)

### Verification

- Gate: `npm run typecheck && npm test` passes (2 files, 10 tests).
- Validation pass 1 (fresh-context subagent): one `fix` finding, fixed (5dbaca8).

## References

- <https://mastra.ai/docs>
- <https://mastra.ai/docs/studio/overview>
- <https://mastra.ai/docs/agents/overview>
- <https://mastra.ai/reference/agents/agent>
- <https://mastra.ai/docs/getting-started/installation>
