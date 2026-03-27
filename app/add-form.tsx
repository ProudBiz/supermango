"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTodo } from "./actions";

export function AddForm() {
  const [state, formAction] = useActionState(addTodo, {
    error: "",
    successCount: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const prevSuccessCount = useRef(0);

  // On successful add, clear input and re-focus it.
  // successCount increments on each successful submission, giving us a
  // reliable signal even though error stays "" → "".
  useEffect(() => {
    if (state.successCount > prevSuccessCount.current) {
      prevSuccessCount.current = state.successCount;
      if (inputRef.current) {
        inputRef.current.value = "";
        // Schedule focus attempts after the browser's form action lifecycle
        // moves focus to the submit button
        const timers = [0, 50, 150].map((delay) =>
          setTimeout(() => inputRef.current?.focus(), delay),
        );
        return () => timers.forEach(clearTimeout);
      }
    }
  }, [state.successCount]);

  return (
    <form action={formAction}>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          name="title"
          placeholder="Add a todo..."
          autoFocus
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      {state.error && (
        <p className="text-red-500 text-sm mt-1">{state.error}</p>
      )}
    </form>
  );
}
