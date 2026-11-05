import { Agent } from "@mastra/core/agent";
import { Mastra } from "@mastra/core/mastra";
import { createMockModel } from "@mastra/core/test-utils/llm-mock";
import { describe, expect, it } from "vitest";

import { createMastraAgentRunner } from "./mastra-agent-runner";

function mastraWithCannedAgent(text: string): Mastra {
  const agent = new Agent({
    id: "canned-agent",
    name: "Canned Agent",
    instructions: "Unused by the mock model.",
    model: createMockModel({ mockText: text, version: "v2" }),
  });
  return new Mastra({ agents: { cannedAgent: agent }, logger: false });
}

describe("createMastraAgentRunner", () => {
  it("returns the registered agent's response text for its id", async () => {
    const runner = createMastraAgentRunner(mastraWithCannedAgent("Canned answer."));

    await expect(runner.generate("canned-agent", "Any prompt")).resolves.toBe("Canned answer.");
  });

  it("rejects an unknown agent id", async () => {
    const runner = createMastraAgentRunner(mastraWithCannedAgent("Canned answer."));

    await expect(runner.generate("missing-agent", "Any prompt")).rejects.toThrow(/missing-agent/);
  });
});
