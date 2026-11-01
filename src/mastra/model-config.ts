import { getProviderConfig } from "@mastra/core/llm";

import type { ModelSetting } from "../agents/instructions";

/**
 * Returns the setting for Mastra once its provider is one Mastra's model
 * router lists, so a typo fails at startup instead of on the first prompt.
 * With a custom endpoint the provider is only a label, so any name passes.
 * Only the provider is checked: the router's model lists trail new releases.
 * Gateways in the provider registry (such as `netlify`) pass; ids routed
 * through the `mastra` gateway or a custom gateway are rejected, since Mastra
 * does not expose its gateway lookup.
 */
export function checkModelProvider(setting: ModelSetting, modelEnvVar: string): ModelSetting {
  if (setting.url) return setting;
  const provider = setting.id.slice(0, setting.id.indexOf("/"));
  if (!getProviderConfig(provider)) {
    throw new Error(
      `${modelEnvVar} names provider "${provider}", which Mastra's model router does not list. Check the spelling against https://mastra.ai/models, or set a custom endpoint with its URL variable.`,
    );
  }
  return setting;
}
