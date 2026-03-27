import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

describe("Add Todo", () => {
  it("shows an input field and add button", () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/add a todo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("adds a todo to the list when pressing Enter", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const input = screen.getByPlaceholderText(/add a todo/i);
    await user.type(input, "Buy groceries{Enter}");
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("adds a todo to the list when clicking the add button", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const input = screen.getByPlaceholderText(/add a todo/i);
    const button = screen.getByRole("button", { name: /add/i });
    await user.type(input, "Walk the dog");
    await user.click(button);
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
  });

  it("clears the input field after submission", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const input = screen.getByPlaceholderText(/add a todo/i);
    await user.type(input, "Buy groceries{Enter}");
    expect(input).toHaveValue("");
  });

  it("does not add empty or whitespace-only todos", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const input = screen.getByPlaceholderText(/add a todo/i);
    const button = screen.getByRole("button", { name: /add/i });

    // Try empty submit
    await user.click(button);
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();

    // Try whitespace-only submit
    await user.type(input, "   {Enter}");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("displays each todo as a list item", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const input = screen.getByPlaceholderText(/add a todo/i);
    await user.type(input, "First todo{Enter}");
    await user.type(input, "Second todo{Enter}");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("First todo");
    expect(items[1]).toHaveTextContent("Second todo");
  });
});
