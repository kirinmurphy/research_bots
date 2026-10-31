import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

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
  const tempDirs: string[] = [];
  const makeTempDir = (prefix: string) => {
    const dir = mkdtempSync(join(tmpdir(), prefix));
    tempDirs.push(dir);
    return dir;
  };
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("skips the bundle's own package.json, as when mastra start runs from .mastra/output", () => {
    const root = makeTempDir("project-root-");
    writeFileSync(join(root, "package.json"), "{}");
    mkdirSync(join(root, "agents"));
    const bundle = join(root, ".mastra", "output");
    mkdirSync(bundle, { recursive: true });
    writeFileSync(join(bundle, "package.json"), "{}");

    expect(findProjectRoot(bundle)).toBe(root);
  });

  it("walks up from mastra dev's working directory to the project root", () => {
    const root = makeTempDir("project-root-");
    writeFileSync(join(root, "package.json"), "{}");
    mkdirSync(join(root, "agents"));
    const devCwd = join(root, "src", "mastra", "public");
    mkdirSync(devCwd, { recursive: true });

    expect(findProjectRoot(devCwd)).toBe(root);
  });

  it("throws when no ancestor is a project root", () => {
    expect(() => findProjectRoot(makeTempDir("no-root-"))).toThrow(/No project root/);
  });
});
