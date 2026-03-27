import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Dark Theme UI", () => {
  it("renders with dark theme container class", () => {
    const { container } = render(<Home />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass("dark-theme");
  });

  it("renders the heading with light text", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { name: /todos/i });
    expect(heading).toBeInTheDocument();
  });

  it("renders the input field", () => {
    render(<Home />);
    const input = screen.getByPlaceholderText(/add a todo/i);
    expect(input).toBeInTheDocument();
  });

  it("renders the add button", () => {
    render(<Home />);
    const button = screen.getByRole("button", { name: /add/i });
    expect(button).toBeInTheDocument();
  });
});
