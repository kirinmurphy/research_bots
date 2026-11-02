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
  const provider = { apiKeyEnvVar: "TEST_API_KEY", urlEnvVar: "TEST_BASE_URL" };
  const resolve = (env: Record<string, string | undefined>) => resolveModel(definition, env, provider);

  it("returns the agent's model and the shared provider key", () => {
    expect(resolve({ TEST_AGENT_MODEL: "zai/some-model", TEST_API_KEY: "key-1" })).toEqual({
      id: "zai/some-model",
      apiKey: "key-1",
    });
  });

  it("switches provider by changing values only", () => {
    expect(resolve({ TEST_AGENT_MODEL: "deepseek/other-model", TEST_API_KEY: "key-2" })).toEqual({
      id: "deepseek/other-model",
      apiKey: "key-2",
    });
  });

  it("gives agents with different model variables the same provider connection", () => {
    const env = {
      TEST_AGENT_MODEL: "nous/model-a",
      OTHER_AGENT_MODEL: "nous/model-b",
      TEST_API_KEY: "key",
      TEST_BASE_URL: "https://inference.example.test/v1",
    };
    expect(resolveModel({ modelEnvVar: "OTHER_AGENT_MODEL" }, env, provider)).toEqual({
      id: "nous/model-b",
      apiKey: "key",
      url: "https://inference.example.test/v1",
    });
    expect(resolve(env)).toEqual({ id: "nous/model-a", apiKey: "key", url: "https://inference.example.test/v1" });
  });

  it.each([
    { TEST_AGENT_MODEL: "zai/some-model" },
    { TEST_AGENT_MODEL: "zai/some-model", TEST_API_KEY: " ", TEST_BASE_URL: " " },
  ])("omits the API key and endpoint when their variables are unset or blank (%o)", (env) => {
    expect(resolve(env)).toEqual({ id: "zai/some-model" });
  });

  it("adds the endpoint for a provider Mastra does not list", () => {
    expect(
      resolve({
        TEST_AGENT_MODEL: "nous/z-ai/some-model",
        TEST_API_KEY: "key-3",
        TEST_BASE_URL: "https://inference.example.test/v1",
      }),
    ).toEqual({ id: "nous/z-ai/some-model", apiKey: "key-3", url: "https://inference.example.test/v1" });
  });

  it.each(["not a url", "ftp://inference.example.test/v1"])("throws naming the variable for a bad endpoint (%s)", (url) => {
    expect(() => resolve({ TEST_AGENT_MODEL: "nous/some-model", TEST_API_KEY: "key", TEST_BASE_URL: url })).toThrow(
      /TEST_BASE_URL must be/,
    );
  });

  it.each([undefined, " "])("throws naming the key variable when an endpoint is set without a key (%o)", (apiKey) => {
    expect(() =>
      resolve({ TEST_AGENT_MODEL: "nous/some-model", TEST_API_KEY: apiKey, TEST_BASE_URL: "https://inference.example.test/v1" }),
    ).toThrow("TEST_API_KEY is required when TEST_BASE_URL is set.");
  });

  it.each(["some-model", "zai/", "/some-model"])("throws naming the variable for a malformed id (%s)", (id) => {
    expect(() => resolve({ TEST_AGENT_MODEL: id })).toThrow(/TEST_AGENT_MODEL must be/);
  });

  it.each([{}, { TEST_AGENT_MODEL: "" }, { TEST_AGENT_MODEL: "  " }])(
    "throws an error naming the variable when it is unset or blank (%o)",
    (env) => {
      expect(() => resolve(env)).toThrow(/TEST_AGENT_MODEL/);
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
