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
      <div>
        <input
          ref={inputRef}
          type="text"
          name="title"
          placeholder="Add a todo..."
          autoFocus
        />
        <button type="submit">Add</button>
      </div>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}
    </form>
  );
}
