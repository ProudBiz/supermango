"use server";

import { count, desc, eq } from "drizzle-orm";
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

export async function getTodos(filter?: "all" | "active" | "completed") {
  const query = db.select().from(todos);

  if (filter === "active") {
    return query
      .where(eq(todos.completed, 0))
      .orderBy(desc(todos.createdAt))
      .all();
  }
  if (filter === "completed") {
    return query
      .where(eq(todos.completed, 1))
      .orderBy(desc(todos.createdAt))
      .all();
  }
  return query.orderBy(desc(todos.createdAt)).all();
}

export async function getActiveTodoCount() {
  const result = db
    .select({ count: count() })
    .from(todos)
    .where(eq(todos.completed, 0))
    .get();
  return result?.count ?? 0;
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

export async function updateTodoText(id: number, text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Todo text cannot be empty");
  }

  const existing = db.select().from(todos).where(eq(todos.id, id)).get();
  if (!existing) {
    throw new Error("Todo not found");
  }

  db.update(todos).set({ text: trimmed }).where(eq(todos.id, id)).run();
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
