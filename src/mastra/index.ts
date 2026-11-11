import { join } from "node:path";

import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { MastraStorageExporter, Observability, SensitiveDataFilter } from "@mastra/observability";

import { findProjectRoot } from "../agents/instructions";
import { createKnowledgeResearcherAgent } from "./agents/knowledge-researcher";

const projectRoot = findProjectRoot();

export const mastra = new Mastra({
  agents: {
    knowledgeResearcher: createKnowledgeResearcherAgent(projectRoot, process.env),
  },
  // Studio's trace view reads from storage; LibSQL alone is enough for traces (metrics would need DuckDB).
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: `file:${join(projectRoot, "mastra.db")}`,
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: "research-bots",
        exporters: [new MastraStorageExporter()],
        spanOutputProcessors: [new SensitiveDataFilter()],
      },
    },
  }),
});
