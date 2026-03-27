"use server";

import { desc } from "drizzle-orm";
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
