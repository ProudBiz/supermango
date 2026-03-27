import { db } from "@/db";
import { todos } from "@/db/schema";
import { toggleTodo, deleteTodo } from "./actions";
import { AddForm } from "./add-form";

export default function Page() {
  const allTodos = db.select().from(todos).all();

  return (
    <main>
      <h1>Todos</h1>
      <AddForm />
      {allTodos.length === 0 ? (
        <p>No todos yet. Add one above!</p>
      ) : (
        <ul>
          {allTodos.map((todo) => (
            <li key={todo.id}>
              <form action={toggleTodo} style={{ display: "inline" }}>
                <input type="hidden" name="id" value={todo.id} />
                <button type="submit">
                  {todo.completed ? "✓" : "○"}
                </button>
              </form>
              <span
                style={{
                  textDecoration: todo.completed ? "line-through" : "none",
                  opacity: todo.completed ? 0.5 : 1,
                }}
              >
                {todo.title}
              </span>
              <form action={deleteTodo} style={{ display: "inline" }}>
                <input type="hidden" name="id" value={todo.id} />
                <button type="submit">✕</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
