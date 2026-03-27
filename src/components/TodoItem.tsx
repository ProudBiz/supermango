"use client";

import { toggleTodo, deleteTodo } from "@/actions/todo-actions";

interface TodoItemProps {
  id: number;
  text: string;
  completed: number;
}

export default function TodoItem({ id, text, completed }: TodoItemProps) {
  return (
    <li className="group flex items-center gap-3 px-2 py-3 text-gray-800">
      <form action={toggleTodo.bind(null, id)}>
        <input
          type="checkbox"
          defaultChecked={!!completed}
          onChange={(e) => e.target.form?.requestSubmit()}
          className="h-4 w-4 rounded border-gray-300"
        />
      </form>
      <span
        className={
          completed
            ? "flex-1 text-gray-400 line-through"
            : "flex-1"
        }
      >
        {text}
      </span>
      <form action={deleteTodo.bind(null, id)}>
        <button
          type="submit"
          className="text-red-400 hover:text-red-600 md:opacity-0 md:group-hover:opacity-100"
          aria-label="Delete"
        >
          ✕
        </button>
      </form>
    </li>
  );
}
