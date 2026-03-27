"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import db from "@/db";
import { todos } from "@/db/schema";

export async function addTodo(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Todo text cannot be empty");
  }

  db.insert(todos).values({ text: trimmed }).run();
  revalidatePath("/");
}

export async function getTodos() {
  return db.select().from(todos).orderBy(desc(todos.createdAt)).all();
}

export async function toggleTodo(id: number) {
  const existing = db.select().from(todos).where(eq(todos.id, id)).get();
  if (!existing) {
    throw new Error("Todo not found");
  }

  db.update(todos)
    .set({ completed: existing.completed ? 0 : 1 })
    .where(eq(todos.id, id))
    .run();
  revalidatePath("/");
}

export async function deleteTodo(id: number) {
  const existing = db.select().from(todos).where(eq(todos.id, id)).get();
  if (!existing) {
    throw new Error("Todo not found");
  }

  db.delete(todos).where(eq(todos.id, id)).run();
  revalidatePath("/");
}
