"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function loadDocument(roomId: string): Promise<string> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("room_documents")
    .select("content")
    .eq("room_id", roomId)
    .maybeSingle();

  if (error) {
    console.error("loadDocument error:", error.message, error);
    return "";
  }

  return data?.content ?? "";
}

export async function saveDocument(roomId: string, html: string) {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("room_documents").upsert({
    room_id: roomId,
    content: html,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("saveDocument error:", error.message, error);
  }
}

export async function getRoomById(roomId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .maybeSingle();

  if (error) {
    console.error("getRoomById error:", error.message, error);
    return null;
  }

  return data;
}
