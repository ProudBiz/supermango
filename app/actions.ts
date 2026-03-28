"use server";

import { revalidatePath } from "next/cache";
import db, { createDb } from "@/db";
import { todos } from "@/db/schema";

export async function addTodoWithDb(
  database: ReturnType<typeof createDb>,
  title: string
) {
  const trimmed = title.trim();
  if (!trimmed) return;

  database.insert(todos).values({ title: trimmed }).run();
  revalidatePath("/");
}

export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;
  await addTodoWithDb(db, title ?? "");
}
