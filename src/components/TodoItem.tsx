"use client";

import { useState, useRef, useEffect } from "react";
import { toggleTodo, deleteTodo, updateTodoText } from "@/actions/todo-actions";

interface TodoItemProps {
  id: number;
  text: string;
  completed: number;
}

export default function TodoItem({ id, text, completed }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  function handleDoubleClick() {
    setIsEditing(true);
    setEditText(text);
    setHasError(false);
  }

  function handleSave() {
    const trimmed = editText.trim();
    if (!trimmed) {
      setHasError(true);
      return;
    }
    setIsEditing(false);
    setHasError(false);
    if (trimmed !== text) {
      updateTodoText(id, trimmed);
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setEditText(text);
    setHasError(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }

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
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => {
            setEditText(e.target.value);
            setHasError(false);
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={`flex-1 rounded border px-2 py-1 text-gray-800 outline-none ${
            hasError
              ? "border-red-400 ring-1 ring-red-400"
              : "border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          }`}
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className={`flex-1 cursor-text ${
            completed
              ? "text-gray-400 line-through"
              : ""
          }`}
        >
          {text}
        </span>
      )}
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
