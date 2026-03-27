"use client";

import { useActionState, useCallback, useRef, useEffect, useState } from "react";
import { addTodo } from "./actions";

export function AddForm() {
  const [state, formAction] = useActionState(addTodo, { error: "" });
  const [inputKey, setInputKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevError = useRef(state.error);

  useEffect(() => {
    if (prevError.current !== state.error && state.error === "") {
      // Successful submission — increment key to remount input with cleared value
      setInputKey((k) => k + 1);
    }
    prevError.current = state.error;
  }, [state]);

  // Ref callback: when the new input mounts after key change, schedule focus
  // after the browser's form action focus management completes
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (node && inputKey > 0) {
        setTimeout(() => node.focus(), 0);
      }
    },
    [inputKey],
  );

  return (
    <form action={formAction}>
      <div>
        <input
          key={inputKey}
          ref={setInputRef}
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
