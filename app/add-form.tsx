"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { addTodo } from "./actions";

export function AddForm() {
  const [state, formAction] = useActionState(addTodo, { error: "" });
  const [inputKey, setInputKey] = useState(0);
  const prevError = useRef(state.error);

  useEffect(() => {
    if (prevError.current !== state.error && state.error === "") {
      // Successful submission — increment key to remount input with autoFocus
      setInputKey((k) => k + 1);
    }
    prevError.current = state.error;
  }, [state]);

  return (
    <form action={formAction}>
      <div>
        <input
          key={inputKey}
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
