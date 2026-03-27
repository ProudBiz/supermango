import { getTodos, getActiveTodoCount } from "@/actions/todo-actions";
import AddTodoForm from "@/components/AddTodoForm";
import FilterTabs from "@/components/FilterTabs";
import TodoList from "@/components/TodoList";

type FilterValue = "all" | "active" | "completed";

const validFilters = new Set<string>(["all", "active", "completed"]);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter: FilterValue = validFilters.has(params.filter ?? "")
    ? (params.filter as FilterValue)
    : "all";

  const [todos, activeCount] = await Promise.all([
    getTodos(filter),
    getActiveTodoCount(),
  ]);

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Supermango Todo
      </h1>
      <AddTodoForm />
      <FilterTabs activeFilter={filter} activeCount={activeCount} />
      <div className="mt-6">
        <TodoList todos={todos} />
      </div>
    </main>
  );
}
