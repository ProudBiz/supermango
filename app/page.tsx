import { db } from "@/db";
import { todos } from "@/db/schema";
import { toggleTodo, deleteTodo } from "./actions";
import { AddForm } from "./add-form";

export default function Page() {
  const allTodos = db.select().from(todos).all();
  const completedCount = allTodos.filter((t) => t.completed === 1).length;

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Todos</h1>
      <AddForm />
      {allTodos.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No todos yet. Add one above!
        </p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-gray-200">
            {allTodos.map((todo) => (
              <li
                key={todo.id}
                className={`flex items-center gap-2 py-2 ${todo.completed ? "opacity-50" : ""}`}
              >
                <form action={toggleTodo}>
                  <input type="hidden" name="id" value={todo.id} />
                  <button
                    type="submit"
                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    {todo.completed ? "✓" : "○"}
                  </button>
                </form>
                <span
                  className={`flex-1 ${todo.completed ? "line-through" : ""}`}
                >
                  {todo.title}
                </span>
                <form action={deleteTodo}>
                  <input type="hidden" name="id" value={todo.id} />
                  <button
                    type="submit"
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 mt-4 text-center">
            {allTodos.length} {allTodos.length === 1 ? "item" : "items"}, {completedCount} completed
          </p>
        </>
      )}
    </main>
  );
}
