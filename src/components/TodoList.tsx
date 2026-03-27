import TodoItem from "./TodoItem";

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
        <TodoItem
          key={todo.id}
          id={todo.id}
          text={todo.text}
          completed={todo.completed}
        />
      ))}
    </ul>
  );
}
