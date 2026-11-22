"use server"

import { easyrentDb } from "@/lib/auth"

/**
 * Used only after a failed email/password sign-in to tell "no such account"
 * apart from a wrong password. It never returns user data — just a boolean.
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  const normalized = String(email || "").trim().toLowerCase()

  if (!normalized) return false

  const user = await easyrentDb
    .collection("user")
    .findOne({ email: normalized }, { projection: { _id: 1 } })

  return Boolean(user)
}
