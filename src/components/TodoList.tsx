interface Todo {
  id: number;
  text: string;
  completed: number;
  createdAt: Date;
}

export default function TodoList({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) {
    return (
      <p className="py-8 text-center text-gray-400">
        No todos yet. Add one above!
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="flex items-center gap-3 px-2 py-3 text-gray-800"
        >
          <span>{todo.text}</span>
        </li>
      ))}
    </ul>
  );
}
