import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Page from "@/app/page";

describe("Home page", () => {
  it("renders the heading", () => {
    render(<Page />);
    expect(
      screen.getByRole("heading", { name: /supermango/i })
    ).toBeInTheDocument();
  });
});
