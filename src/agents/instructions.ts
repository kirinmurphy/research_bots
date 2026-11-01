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

export interface ModelSetting {
  /**
   * `provider/model-name`. With `url` set, `provider` is only a label and
   * everything after the first slash is sent to the endpoint as the model name.
   */
  id: `${string}/${string}`;
  /**
   * Absent when the agent's key variable is unset or blank, and then Mastra
   * uses the provider's standard key variable. Always present with `url`,
   * since Mastra has no fallback for a custom endpoint.
   */
  apiKey?: string;
  /** OpenAI-compatible base URL; absent means the provider's own endpoint from Mastra's registry. */
  url?: string;
}

/**
 * Reads the agent's model, API key, and optional endpoint from its variables,
 * so switching provider, including to one Mastra does not list, changes only
 * their values. Throws naming the variable when the model is missing or not
 * `provider/model-name`, the endpoint is not an http(s) URL, or an endpoint
 * is set without a key.
 */
export function resolveModel(
  definition: Pick<AgentDefinition, "modelEnvVar" | "apiKeyEnvVar" | "modelUrlEnvVar">,
  env: Record<string, string | undefined>,
): ModelSetting {
  const id = env[definition.modelEnvVar]?.trim();
  if (!id) {
    throw new Error(
      `${definition.modelEnvVar} is not set. Set it to a Mastra model string (provider/model-name), for example in .env.`,
    );
  }
  if (!isModelRouterId(id)) {
    throw new Error(`${definition.modelEnvVar} must be provider/model-name, got "${id}".`);
  }
  const apiKey = env[definition.apiKeyEnvVar]?.trim();
  const url = env[definition.modelUrlEnvVar]?.trim();
  if (url && !isHttpUrl(url)) {
    throw new Error(`${definition.modelUrlEnvVar} must be an http(s) URL, got "${url}".`);
  }
  if (url && !apiKey) {
    throw new Error(`${definition.apiKeyEnvVar} is required when ${definition.modelUrlEnvVar} is set.`);
  }
  return { id, ...(apiKey && { apiKey }), ...(url && { url }) };
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

function isModelRouterId(value: string): value is ModelSetting["id"] {
  const slash = value.indexOf("/");
  return slash > 0 && slash < value.length - 1;
}
