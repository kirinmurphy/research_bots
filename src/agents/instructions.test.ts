import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { findProjectRoot, loadInstructions, resolveModel } from "./instructions";

const fixtures = fileURLToPath(new URL("./__fixtures__/", import.meta.url));
const definition = { instructionsPath: "agents/a/AGENT.md", modelEnvVar: "TEST_AGENT_MODEL" };

describe("loadInstructions", () => {
  it("returns the AGENT.md text under the project root", () => {
    expect(loadInstructions(definition, join(fixtures, "project-a"))).toBe("You are agent A.\n");
  });

  it("returns different instructions for a different AGENT.md", () => {
    expect(loadInstructions(definition, join(fixtures, "project-b"))).toBe("You are a different agent.\n");
  });
});

describe("resolveModel", () => {
  it("returns the model string from the definition's variable", () => {
    expect(resolveModel(definition, { TEST_AGENT_MODEL: "anthropic/some-model" })).toBe("anthropic/some-model");
  });

  it.each([{}, { TEST_AGENT_MODEL: "" }, { TEST_AGENT_MODEL: "  " }])(
    "throws an error naming the variable when it is unset or blank (%o)",
    (env) => {
      expect(() => resolveModel(definition, env)).toThrow(/TEST_AGENT_MODEL/);
    },
  );
});

describe("findProjectRoot", () => {
  it("skips a nested package.json without agents/, as in mastra dev's bundle directory", () => {
    const root = mkdtempSync(join(tmpdir(), "project-root-"));
    writeFileSync(join(root, "package.json"), "{}");
    mkdirSync(join(root, "agents"));
    const nested = join(root, "src", "mastra", "public");
    mkdirSync(nested, { recursive: true });
    writeFileSync(join(root, "src", "package.json"), "{}");

    expect(findProjectRoot(nested)).toBe(root);
  });

  it("throws when no ancestor is a project root", () => {
    expect(() => findProjectRoot(mkdtempSync(join(tmpdir(), "no-root-")))).toThrow(/No project root/);
  });
});
