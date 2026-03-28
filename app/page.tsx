import { desc } from "drizzle-orm";
import db from "@/db";
import { todos } from "@/db/schema";
import { addTodo, toggleTodo, deleteTodo } from "@/app/actions";

export default async function Home() {
  const allTodos = db.select().from(todos).orderBy(desc(todos.createdAt)).all();

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Todos</h1>

      <form action={addTodo} className="flex gap-2 mb-8">
        <input
          type="text"
          name="title"
          placeholder="Add a todo..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {allTodos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm"
          >
            <form action={toggleTodo}>
              <input type="hidden" name="id" value={todo.id} />
              <button type="submit">
                <input
                  type="checkbox"
                  checked={todo.completed === 1}
                  readOnly
                  tabIndex={-1}
                  className="pointer-events-none"
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
    </main>
  );
}
