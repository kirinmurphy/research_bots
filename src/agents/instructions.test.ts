import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { findProjectRoot, loadInstructions, resolveModel } from "./instructions";

const fixtures = fileURLToPath(new URL("./__fixtures__/", import.meta.url));
const definition = {
  instructionsPath: "agents/a/AGENT.md",
  modelEnvVar: "TEST_AGENT_MODEL",
  apiKeyEnvVar: "TEST_AGENT_API_KEY",
  modelUrlEnvVar: "TEST_AGENT_MODEL_URL",
};

describe("loadInstructions", () => {
  it("returns the AGENT.md text under the project root", () => {
    expect(loadInstructions(definition, join(fixtures, "project-a"))).toBe("You are agent A.\n");
  });

  it("returns different instructions for a different AGENT.md", () => {
    expect(loadInstructions(definition, join(fixtures, "project-b"))).toBe("You are a different agent.\n");
  });
});

describe("resolveModel", () => {
  it("returns the model id and API key from the definition's two variables", () => {
    expect(resolveModel(definition, { TEST_AGENT_MODEL: "zai/some-model", TEST_AGENT_API_KEY: "key-1" })).toEqual({
      id: "zai/some-model",
      apiKey: "key-1",
    });
  });

  it("switches provider by changing values only", () => {
    expect(
      resolveModel(definition, { TEST_AGENT_MODEL: "deepseek/other-model", TEST_AGENT_API_KEY: "key-2" }),
    ).toEqual({ id: "deepseek/other-model", apiKey: "key-2" });
  });

  it.each([
    { TEST_AGENT_MODEL: "zai/some-model" },
    { TEST_AGENT_MODEL: "zai/some-model", TEST_AGENT_API_KEY: " ", TEST_AGENT_MODEL_URL: " " },
  ])(
    "omits the API key and endpoint when their variables are unset or blank (%o)",
    (env) => {
      expect(resolveModel(definition, env)).toEqual({ id: "zai/some-model" });
    },
  );

  it("adds the endpoint for a provider Mastra does not list", () => {
    expect(
      resolveModel(definition, {
        TEST_AGENT_MODEL: "nous/z-ai/some-model",
        TEST_AGENT_API_KEY: "key-3",
        TEST_AGENT_MODEL_URL: "https://inference.example.test/v1",
      }),
    ).toEqual({ id: "nous/z-ai/some-model", apiKey: "key-3", url: "https://inference.example.test/v1" });
  });

  it.each(["not a url", "ftp://inference.example.test/v1"])("throws naming the variable for a bad endpoint (%s)", (url) => {
    expect(() => resolveModel(definition, { TEST_AGENT_MODEL: "nous/some-model", TEST_AGENT_MODEL_URL: url })).toThrow(
      /TEST_AGENT_MODEL_URL must be/,
    );
  });

  it.each(["some-model", "zai/", "/some-model"])("throws naming the variable for a malformed id (%s)", (id) => {
    expect(() => resolveModel(definition, { TEST_AGENT_MODEL: id })).toThrow(/TEST_AGENT_MODEL must be/);
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
