import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Bot Entry Point and Process Scripts", () => {
  const pkg = JSON.parse(
    readFileSync(join(__dirname, "../../package.json"), "utf-8"),
  );

  it("has pnpm bot script that runs the bolt entry point", () => {
    expect(pkg.scripts.bot).toBeDefined();
    expect(pkg.scripts.bot).toContain("src/bolt/index.ts");
  });

  it("has pnpm dev script that runs bot and next concurrently", () => {
    expect(pkg.scripts.dev).toBeDefined();
    expect(pkg.scripts.dev).toContain("pnpm next");
    expect(pkg.scripts.dev).toContain("pnpm bot");
  });

  it("entry point imports dotenv/config for env var loading", async () => {
    const source = readFileSync(
      join(__dirname, "index.ts"),
      "utf-8",
    );
    expect(source).toContain('import "dotenv/config"');
  });

  it("entry point starts the Bolt app with socket mode", async () => {
    const source = readFileSync(
      join(__dirname, "index.ts"),
      "utf-8",
    );
    expect(source).toContain("socketMode: true");
    expect(source).toContain("app.start()");
    expect(source).toContain('console.log("Bolt app started")');
  });

  it("concurrently is installed as a dev dependency", () => {
    expect(pkg.devDependencies.concurrently).toBeDefined();
  });
});
