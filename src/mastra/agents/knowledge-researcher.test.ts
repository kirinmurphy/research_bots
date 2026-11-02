import { describe, expect, it } from "vitest";

import { findProjectRoot } from "../../agents/instructions";
import { createKnowledgeResearcherAgent } from "./knowledge-researcher";

const projectRoot = findProjectRoot();

describe("createKnowledgeResearcherAgent", () => {
  it("builds the researcher for a listed provider", () => {
    const agent = createKnowledgeResearcherAgent(projectRoot, { RESEARCH_MODEL: "zai/glm-5.3-flash" });

    expect(agent.id).toBe("knowledge-researcher");
  });

  it("stops on a provider Mastra does not list", () => {
    expect(() => createKnowledgeResearcherAgent(projectRoot, { RESEARCH_MODEL: "zia/glm-5.3-flash" })).toThrow(
      /RESEARCH_MODEL names provider "zia"/,
    );
  });

  it("stops on an endpoint without a key", () => {
    expect(() =>
      createKnowledgeResearcherAgent(projectRoot, {
        RESEARCH_MODEL: "nous/some-model",
        MODEL_BASE_URL: "https://inference.example.test/v1",
      }),
    ).toThrow("MODEL_API_KEY is required when MODEL_BASE_URL is set.");
  });
});
