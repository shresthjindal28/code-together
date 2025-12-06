"use server"

import { createSupabaseServerClient } from "@/lib/supabaseServer"

export async function createRoom(name: string, userId: string) {
  const supabase = createSupabaseServerClient()

  const id = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    + "-" +
    Math.random().toString(36).slice(2,6)

  const { error } = await supabase
    .from("rooms")
    .insert({
      id,
      name,
      owner_id: userId
    })

  if (error) throw error
  return id
}
