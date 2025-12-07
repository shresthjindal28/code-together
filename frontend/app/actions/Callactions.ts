"use server"

import { createSupabaseServerClient } from "@/lib/supabaseServer"

export async function createRoom(roomId: string) {
  const supabase = createSupabaseServerClient()

  await supabase.from("calls").insert({
    id: roomId,
    active: true,
  })

  return true
}

export async function endRoom(roomId: string) {
  const supabase = createSupabaseServerClient()
  await supabase.from("calls").update({ active: false }).eq("id", roomId)
}

export async function getActiveRooms() {
  const supabase = createSupabaseServerClient()

  const { data } = await supabase
    .from("calls")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })

  return data ?? []
}

export async function joinCall(roomId: string, name: string, isHost: boolean) {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from("call_participants")
    .insert({
      call_id: roomId,
      name,
      is_host: isHost,
      in_call: true,
    })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function leaveCall(participantId: string) {
  const supabase = createSupabaseServerClient()

  await supabase
    .from("call_participants")
    .update({
      in_call: false,
      left_at: new Date().toISOString(),
    })
    .eq("id", participantId)
}
