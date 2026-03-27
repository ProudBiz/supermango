"use client";

import { useState, FormEvent } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  function toggleTodo(id: number) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function deleteTodo(id: number) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodos((prev) => [...prev, { id: Date.now(), text: trimmed, completed: false }]);
    setInput("");
  }

  return (
    <div className="dark-theme flex flex-col flex-1 items-center justify-center bg-[#0a0a0a] font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-16 px-4">
        <h1 className="text-3xl font-semibold tracking-tight text-[#e0e0e0] mb-8">
          Todos
        </h1>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2 mb-6">
          <input
            type="text"
            placeholder="Add a todo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-300"
          >
            Add
          </button>
        </form>
        <ul className="w-full max-w-md">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 border-b border-zinc-800 py-3.5 text-zinc-100"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="h-4 w-4 cursor-pointer rounded border-zinc-600 accent-zinc-400"
              />
              <span className={`flex-1 ${todo.completed ? "line-through opacity-50" : ""}`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="ml-auto rounded-md px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
