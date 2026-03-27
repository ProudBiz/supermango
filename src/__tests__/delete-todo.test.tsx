import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

async function addTodo(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByPlaceholderText(/add a todo/i);
  await user.type(input, `${text}{Enter}`);
}

describe("Delete Todo", () => {
  it("renders a delete button for each todo item", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "Buy groceries");
    expect(
      screen.getByRole("button", { name: /delete/i })
    ).toBeInTheDocument();
  });

  it("removes the todo when delete is clicked", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "Buy groceries");
    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteBtn);
    expect(screen.queryByText("Buy groceries")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("only removes the targeted todo, leaving others intact", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "First todo");
    await addTodo(user, "Second todo");
    await addTodo(user, "Third todo");

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    // Delete the second todo
    await user.click(deleteButtons[1]);

    expect(screen.queryByText("Second todo")).not.toBeInTheDocument();
    expect(screen.getByText("First todo")).toBeInTheDocument();
    expect(screen.getByText("Third todo")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("re-renders correctly after multiple deletions", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await addTodo(user, "Alpha");
    await addTodo(user, "Beta");
    await addTodo(user, "Gamma");

    // Delete first
    let deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    await user.click(deleteButtons[0]);
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    // Delete last remaining
    deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    await user.click(deleteButtons[1]);
    expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });
});
