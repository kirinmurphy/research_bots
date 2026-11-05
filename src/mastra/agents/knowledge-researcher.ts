import { Agent } from "@mastra/core/agent";

import { knowledgeResearcher } from "../../agents/definitions";
import { loadInstructions, resolveModel } from "../../agents/instructions";
import { checkModelProvider } from "../model-config";

/** Instructions are read once here; an AGENT.md edit takes effect on restart. */
export function createKnowledgeResearcherAgent(projectRoot: string, env: Record<string, string | undefined>): Agent {
  return new Agent({
    id: knowledgeResearcher.id,
    name: knowledgeResearcher.name,
    instructions: loadInstructions(knowledgeResearcher, projectRoot),
    model: checkModelProvider(resolveModel(knowledgeResearcher, env), knowledgeResearcher.modelEnvVar),
  });
}
