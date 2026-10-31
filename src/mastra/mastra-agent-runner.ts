import type { Mastra } from "@mastra/core/mastra";

import type { AgentRunner } from "../agents/agent-runner";

/** Delegates straight to Mastra's agent registry; retries, memory, and tracing stay Mastra's. */
export function createMastraAgentRunner(mastra: Mastra): AgentRunner {
  return {
    async generate(agentId, prompt) {
      const result = await mastra.getAgentById(agentId).generate(prompt);
      return result.text;
    },
  };
}
