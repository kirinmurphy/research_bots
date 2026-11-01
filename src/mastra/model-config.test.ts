import { describe, expect, it } from "vitest";

import { checkModelProvider } from "./model-config";

describe("checkModelProvider", () => {
  it.each(["zai/glm-5.3-flash", "deepseek/deepseek-v4-flash", "opencode/glm-5.3-flash"])(
    "accepts a provider Mastra lists (%s)",
    (id) => {
      expect(checkModelProvider({ id: id as `${string}/${string}` }, "TEST_AGENT_MODEL")).toEqual({ id });
    },
  );

  it("accepts a model name the router does not list for a listed provider", () => {
    expect(checkModelProvider({ id: "zai/some-future-model" }, "TEST_AGENT_MODEL")).toEqual({
      id: "zai/some-future-model",
    });
  });

  it("throws naming the variable and provider for an unlisted provider", () => {
    expect(() => checkModelProvider({ id: "zia/glm-5.3-flash" }, "TEST_AGENT_MODEL")).toThrow(
      /TEST_AGENT_MODEL names provider "zia"/,
    );
  });

  it("accepts any provider label when a custom endpoint is set", () => {
    const setting = { id: "nous/some-model", apiKey: "key", url: "https://inference.example.test/v1" } as const;
    expect(checkModelProvider(setting, "TEST_AGENT_MODEL")).toEqual(setting);
  });
});
