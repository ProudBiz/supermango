import { describe, it, expect } from "vitest";

describe("Project Setup", () => {
  it("should export a Home component from the page module", async () => {
    const mod = await import("./page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("Home component should return a valid React element", async () => {
    const { default: Home } = await import("./page");
    const result = Home();
    expect(result).toBeDefined();
    expect(result.type).toBe("main");
  });

  it("should have Tailwind utility classes in the rendered output", async () => {
    const { default: Home } = await import("./page");
    const result = Home();
    expect(result.props.className).toContain("flex");
    expect(result.props.className).toContain("min-h-screen");
  });
});
