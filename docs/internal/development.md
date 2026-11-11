# Develop and check the project

Run these commands from the project root before submitting a change:

```bash
npm run typecheck
npm test
```

The automated tests never call a model. The runner test uses Mastra’s mock model, which returns a prepared answer without contacting a provider. Live answer quality and Studio trace display need the separate [manual check](../support/verify-researcher.md).

## Finding tests

Each `*.test.ts` file currently sits beside the module it checks. Instruction-loader fixtures live in `src/agents/__fixtures__/`. For example, `src/agents/instructions.test.ts` checks loading instructions and validating model settings.

This keeps a module and its checks together when you change it. A separate folder for future tests spanning multiple modules is an option; no such suite exists yet.

## Build and run

```bash
npm run build
npm start
```

Keep the root `agents/` directory available: the built application still reads its Markdown instructions at startup.

## Dependencies

Versions installed at initial setup (see `package-lock.json` for the resolved versions in this checkout):

| Package | Version |
| --- | --- |
| `@mastra/core` | 1.79.0 |
| `mastra` (CLI) | 1.35.0 |
| `@mastra/libsql` | 1.27.0 |
| `@mastra/observability` | 1.21.0 |

These were the newest releases allowed by an npm `min-release-age` of 7 days when the project was set up. Upgrade them together with `npm install @mastra/core@latest mastra@latest @mastra/libsql@latest @mastra/observability@latest`.

[Architecture](architecture.md) · [Back to the README](../../README.md)
