"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTodo } from "./actions";

export function AddForm() {
  const [state, formAction] = useActionState(addTodo, { error: "" });
  const inputRef = useRef<HTMLInputElement>(null);
  const prevError = useRef(state.error);

  useEffect(() => {
    if (prevError.current !== state.error && state.error === "") {
      // Successful submission — clear input and retain focus
      if (inputRef.current) {
        inputRef.current.value = "";
        // Use requestAnimationFrame to re-focus after the browser's
        // form action lifecycle moves focus to the submit button
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    }
    prevError.current = state.error;
  }, [state]);

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
