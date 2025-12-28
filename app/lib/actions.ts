"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { documents } from "./db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveDocument(content: string, title?: string, id?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (id) {
    // Update existing
    await db
      .update(documents)
      .set({ content, title, updatedAt: new Date() })
      .where(eq(documents.id, id as any));
  } else {
    // Create new
    await db.insert(documents).values({
      userId,
      content,
      title: title || "Untitled Document",
    });
  }

  revalidatePath("/");
}

export async function getDocuments() {
  const { userId } = await auth();
  if (!userId) return [];

  return db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.updatedAt));
}

export async function deleteDocument(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(documents).where(eq(documents.id, id as any));
  revalidatePath("/");
}

