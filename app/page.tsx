import { desc } from "drizzle-orm";
import db from "@/db";
import { todos } from "@/db/schema";
import { toggleTodo, deleteTodo } from "@/app/actions";
import AddTodoForm from "@/app/add-todo-form";

export default async function Home() {
  const allTodos = db.select().from(todos).orderBy(desc(todos.createdAt)).all();

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Todos</h1>

      <AddTodoForm />

      {allTodos.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          No todos yet. Add one above!
        </p>
      ) : (
      <ul className="space-y-2">
        {allTodos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm"
          >
            <form action={toggleTodo}>
              <input type="hidden" name="id" value={todo.id} />
              <button type="submit" className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={todo.completed === 1}
                  tabIndex={-1}
                  className="pointer-events-none cursor-pointer"
                />
              </button>
            </form>
            <span
              className={
                todo.completed === 1 ? "flex-1 line-through opacity-50" : "flex-1"
              }
            >
              {todo.title}
            </span>
            <form action={deleteTodo}>
              <input type="hidden" name="id" value={todo.id} />
              <button
                type="submit"
                aria-label="Delete"
                className="text-gray-400 hover:text-red-500 text-lg leading-none"
              >
                ×
              </button>
            </form>
          </li>
        ))}
      </ul>
      )}
    </main>
  );
}
