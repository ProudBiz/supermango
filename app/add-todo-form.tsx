"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTodo } from "@/app/actions";

export default function AddTodoForm() {
  const [state, formAction, isPending] = useActionState(addTodo, {
    error: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (prevStateRef.current !== state && state.error === null && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    prevStateRef.current = state;
  }, [state]);

  return (
    <div className="mb-8">
      <form action={formAction} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          name="title"
          placeholder="Add a todo..."
          autoFocus
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}
