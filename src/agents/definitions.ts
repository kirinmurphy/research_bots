export interface AgentDefinition {
  id: string;
  name: string;
  /** Path to the agent's identity file, relative to the project root. */
  instructionsPath: string;
  /**
   * Environment variable holding the agent's model-router string
   * (`provider/model-name`). Named by use case, so agents doing the same kind
   * of work can share one.
   */
  modelEnvVar: string;
}

export interface ModelProviderEnvVars {
  apiKeyEnvVar: string;
  /** Optional OpenAI-compatible endpoint, for providers Mastra does not list. */
  urlEnvVar: string;
}

/** Every agent reaches its model through one provider connection: one key, one optional endpoint. */
export const modelProvider = {
  apiKeyEnvVar: "MODEL_API_KEY",
  urlEnvVar: "MODEL_BASE_URL",
} as const satisfies ModelProviderEnvVars;

export const knowledgeResearcher = {
  id: "knowledge-researcher",
  name: "Knowledge Researcher",
  instructionsPath: "agents/knowledge-researcher/AGENT.md",
  modelEnvVar: "RESEARCH_MODEL",
} as const satisfies AgentDefinition;
