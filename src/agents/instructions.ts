import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import type { AgentDefinition } from "./definitions";

/**
 * Finds the project root by walking up from `startDir` to the nearest
 * directory holding both `package.json` and `agents/`.
 *
 * Mastra runs bundled code from `.mastra/output`, so the module location is
 * never the project root, and the working directory is not either:
 * `mastra dev` sets it to `src/mastra/public`, `mastra start` to
 * `.mastra/output`. That folder has its own `package.json`, which is why
 * `agents/` is part of the marker.
 */
export function findProjectRoot(startDir: string = process.cwd()): string {
  let dir = resolve(startDir);
  while (true) {
    if (existsSync(join(dir, "package.json")) && existsSync(join(dir, "agents"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`No project root (a directory with package.json and agents/) above ${startDir}`);
    }
    dir = parent;
  }
}

/** Reads an agent's AGENT.md, resolved from the project root. */
export function loadInstructions(definition: Pick<AgentDefinition, "instructionsPath">, projectRoot: string): string {
  return readFileSync(join(projectRoot, definition.instructionsPath), "utf8");
}

/** Returns the agent's Mastra model-router string, or throws naming the variable to set. */
export function resolveModel(
  definition: Pick<AgentDefinition, "modelEnvVar">,
  env: Record<string, string | undefined>,
): string {
  const model = env[definition.modelEnvVar]?.trim();
  if (!model) {
    throw new Error(
      `${definition.modelEnvVar} is not set. Set it to a Mastra model string (provider/model-name), for example in .env.`,
    );
  }
  return model;
}
