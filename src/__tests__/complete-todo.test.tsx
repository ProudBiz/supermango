import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

async function addTodo(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByPlaceholderText(/add a todo/i);
  await user.type(input, `${text}{Enter}`);
}

describe("Complete Todo", () => {
  it("renders a checkbox for each todo item", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "Buy groceries");
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("toggles todo to completed when checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "Buy groceries");
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("applies completed styles (strikethrough and reduced opacity) when completed", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "Buy groceries");
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    const todoText = screen.getByText("Buy groceries");
    expect(todoText).toHaveClass("line-through");
    expect(todoText).toHaveClass("opacity-50");
  });

  it("toggles back to active and restores normal appearance", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "Buy groceries");
    const checkbox = screen.getByRole("checkbox");
    // Complete
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    // Uncomplete
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    const todoText = screen.getByText("Buy groceries");
    expect(todoText).not.toHaveClass("line-through");
    expect(todoText).not.toHaveClass("opacity-50");
  });

  it("toggles individual todos independently", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "First todo");
    await addTodo(user, "Second todo");
    const checkboxes = screen.getAllByRole("checkbox");
    // Complete only the first
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });
});
