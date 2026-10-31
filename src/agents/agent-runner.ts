/**
 * The one way application code calls an agent. Domain code receives an
 * AgentRunner as a parameter, so it never depends on the agent framework and
 * its tests can pass a fake runner instead of calling a model.
 */
export interface AgentRunner {
  /** Resolves to the agent's response text; rejects for an unknown agent id. */
  generate(agentId: string, prompt: string): Promise<string>;
}
