import { describe, it, expect } from "vitest";
import FilterTabs from "./FilterTabs";

function getLinks(result: any): any[] {
  // Links are inside nav > div (first child)
  const children = Array.isArray(result.props.children)
    ? result.props.children
    : [result.props.children];
  const linkContainer = children.find(
    (c: any) => c?.type === "div"
  );
  const links = Array.isArray(linkContainer.props.children)
    ? linkContainer.props.children
    : [linkContainer.props.children];
  return links.filter((c: any) => c?.type === "a");
}

function getCountSpan(result: any): any {
  const children = Array.isArray(result.props.children)
    ? result.props.children
    : [result.props.children];
  return children.find((c: any) => c?.type === "span");
}

function spanText(span: any): string {
  const kids = span.props.children;
  if (Array.isArray(kids)) return kids.join("");
  return String(kids);
}

describe("FilterTabs", () => {
  it("should export a default component", () => {
    expect(FilterTabs).toBeDefined();
    expect(typeof FilterTabs).toBe("function");
  });

  it("should render three filter links", () => {
    const result = FilterTabs({ activeFilter: "all", activeCount: 0 });
    const links = getLinks(result);
    expect(links).toHaveLength(3);
    expect(links[0].props.children).toBe("All");
    expect(links[1].props.children).toBe("Active");
    expect(links[2].props.children).toBe("Completed");
  });

  it("should highlight 'All' when activeFilter is 'all'", () => {
    const result = FilterTabs({ activeFilter: "all", activeCount: 0 });
    const links = getLinks(result);
    const allLink = links.find((l: any) => l.props.children === "All");
    expect(allLink.props.className).toContain("bg-gray-900");
  });

  it("should highlight 'Active' when activeFilter is 'active'", () => {
    const result = FilterTabs({ activeFilter: "active", activeCount: 0 });
    const links = getLinks(result);
    const activeLink = links.find((l: any) => l.props.children === "Active");
    expect(activeLink.props.className).toContain("bg-gray-900");
  });

  it("should highlight 'Completed' when activeFilter is 'completed'", () => {
    const result = FilterTabs({
      activeFilter: "completed",
      activeCount: 0,
    });
    const links = getLinks(result);
    const completedLink = links.find(
      (l: any) => l.props.children === "Completed"
    );
    expect(completedLink.props.className).toContain("bg-gray-900");
  });

  it("should not highlight non-active tabs", () => {
    const result = FilterTabs({ activeFilter: "active", activeCount: 0 });
    const links = getLinks(result);
    const allLink = links.find((l: any) => l.props.children === "All");
    const completedLink = links.find(
      (l: any) => l.props.children === "Completed"
    );
    expect(allLink.props.className).not.toContain("bg-gray-900");
    expect(completedLink.props.className).not.toContain("bg-gray-900");
  });

  it("should link 'All' to / (no search param)", () => {
    const result = FilterTabs({ activeFilter: "all", activeCount: 0 });
    const links = getLinks(result);
    const allLink = links.find((l: any) => l.props.children === "All");
    expect(allLink.props.href).toBe("/");
  });

  it("should link 'Active' to ?filter=active", () => {
    const result = FilterTabs({ activeFilter: "all", activeCount: 0 });
    const links = getLinks(result);
    const activeLink = links.find((l: any) => l.props.children === "Active");
    expect(activeLink.props.href).toBe("?filter=active");
  });

  it("should link 'Completed' to ?filter=completed", () => {
    const result = FilterTabs({ activeFilter: "all", activeCount: 0 });
    const links = getLinks(result);
    const completedLink = links.find(
      (l: any) => l.props.children === "Completed"
    );
    expect(completedLink.props.href).toBe("?filter=completed");
  });

  it("should display active count with plural", () => {
    const result = FilterTabs({ activeFilter: "all", activeCount: 5 });
    const span = getCountSpan(result);
    expect(spanText(span)).toBe("5 items left");
  });

  it("should display '1 item left' for singular", () => {
    const result = FilterTabs({ activeFilter: "all", activeCount: 1 });
    const span = getCountSpan(result);
    expect(spanText(span)).toBe("1 item left");
  });

  it("should display '0 items left' when count is zero", () => {
    const result = FilterTabs({ activeFilter: "all", activeCount: 0 });
    const span = getCountSpan(result);
    expect(spanText(span)).toBe("0 items left");
  });
});
