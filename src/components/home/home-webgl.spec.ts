import { afterEach, describe, expect, it } from "vitest";
import { isWebGLSupported } from "./home-webgl";

const globalScope = globalThis as unknown as Record<string, unknown>;
const realDocument = globalScope["document"];

function stubDocument(getContext: () => unknown) {
  globalScope["document"] = {
    createElement: () => ({ getContext }),
  };
}

describe("isWebGLSupported", () => {
  afterEach(() => {
    globalScope["document"] = realDocument;
  });

  it("passes when a context can be created", () => {
    stubDocument(() => ({}));
    expect(isWebGLSupported()).toBe(true);
  });

  it("fails when contexts are blocked", () => {
    stubDocument(() => null);
    expect(isWebGLSupported()).toBe(false);
  });

  it("fails when probing throws", () => {
    globalScope["document"] = {
      createElement: () => {
        throw new Error("denied");
      },
    };
    expect(isWebGLSupported()).toBe(false);
  });
});
