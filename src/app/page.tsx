"use client";

import { useState, FormEvent } from "react";

interface Todo {
  id: number;
  text: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodos((prev) => [...prev, { id: Date.now(), text: trimmed }]);
    setInput("");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-16 px-4">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50 mb-8">
          Todos
        </h1>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2 mb-6">
          <input
            type="text"
            placeholder="Add a todo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add
          </button>
        </form>
        <ul className="w-full max-w-md">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="border-b border-zinc-200 py-3 text-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
            >
              {todo.text}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
