"use client";

import { useRef } from "react";
import { addTodo } from "@/actions/todo-actions";

export default function AddTodoForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const text = formData.get("text") as string;
    if (!text?.trim()) return;
    await addTodo(text);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-2">
      <input
        type="text"
        name="text"
        required
        placeholder="What needs to be done?"
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        Add
      </button>
    </form>
  );
}
