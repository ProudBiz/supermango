"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import db, { createDb } from "@/db";
import { todos } from "@/db/schema";

export async function addTodoWithDb(
  database: ReturnType<typeof createDb>,
  title: string
): Promise<{ error: string | null }> {
  const trimmed = title.trim();
  if (!trimmed) return { error: "Title cannot be empty" };
  if (trimmed.length > 500) return { error: "Title must be 500 characters or less" };

  database.insert(todos).values({ title: trimmed }).run();
  revalidatePath("/");
  return { error: null };
}

export async function addTodo(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const title = formData.get("title") as string;
  return addTodoWithDb(db, title ?? "");
}

export async function toggleTodoWithDb(
  database: ReturnType<typeof createDb>,
  id: number
) {
  const existing = database
    .select()
    .from(todos)
    .where(eq(todos.id, id))
    .all();
  if (existing.length === 0) return;

  const current = existing[0].completed;
  database
    .update(todos)
    .set({ completed: current === 0 ? 1 : 0 })
    .where(eq(todos.id, id))
    .run();
  revalidatePath("/");
}

export async function toggleTodo(formData: FormData) {
  const id = Number(formData.get("id"));
  await toggleTodoWithDb(db, id);
}

export async function deleteTodoWithDb(
  database: ReturnType<typeof createDb>,
  id: number
) {
  database.delete(todos).where(eq(todos.id, id)).run();
  revalidatePath("/");
}

export async function deleteTodo(formData: FormData) {
  const id = Number(formData.get("id"));
  await deleteTodoWithDb(db, id);
}
