import { getTodos } from "@/actions/todo-actions";
import AddTodoForm from "@/components/AddTodoForm";
import TodoList from "@/components/TodoList";

export default async function Home() {
  const todos = await getTodos();

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Supermango Todo
      </h1>
      <AddTodoForm />
      <div className="mt-6">
        <TodoList todos={todos} />
      </div>
    </main>
  );
}
