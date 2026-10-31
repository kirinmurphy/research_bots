export interface AgentDefinition {
  id: string;
  name: string;
  /** Path to the agent's identity file, relative to the project root. */
  instructionsPath: string;
  /** Environment variable holding a Mastra model-router string (`provider/model-name`). */
  modelEnvVar: string;
  /** Environment variable holding the API key for whichever provider `modelEnvVar` names. */
  apiKeyEnvVar: string;
}

export const knowledgeResearcher = {
  id: "knowledge-researcher",
  name: "Knowledge Researcher",
  instructionsPath: "agents/knowledge-researcher/AGENT.md",
  modelEnvVar: "KNOWLEDGE_RESEARCHER_MODEL",
  apiKeyEnvVar: "KNOWLEDGE_RESEARCHER_API_KEY",
} as const satisfies AgentDefinition;
