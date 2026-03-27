"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { validateTodoTitle } from "@/lib/validate";

export async function addTodo(
  prevState: { error: string; successCount: number },
  formData: FormData,
): Promise<{ error: string; successCount: number }> {
  const result = validateTodoTitle(formData.get("title"));

  if (!result.valid) {
    return { error: result.error, successCount: prevState.successCount };
  }

  db.insert(todos).values({ title: result.title }).run();
  revalidatePath("/");
  return { error: "", successCount: prevState.successCount + 1 };
}

export async function toggleTodo(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const todo = db.select().from(todos).where(eq(todos.id, id)).get();

  if (!todo) return;

  db.update(todos)
    .set({ completed: todo.completed === 1 ? 0 : 1 })
    .where(eq(todos.id, id))
    .run();
  revalidatePath("/");
}

export async function deleteTodo(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  db.delete(todos).where(eq(todos.id, id)).run();
  revalidatePath("/");
}
