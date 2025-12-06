"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

// TABLE: room_documents
// columns: room_id (text, PK), content (text), updated_at (timestamptz)

export async function loadDocument(roomId: string): Promise<string> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("room_documents")
    .select("content")
    .eq("room_id", roomId)
    .maybeSingle();

  if (error) {
    console.error("loadDocument error", error);
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
    console.error("saveDocument error", error);
  }
}
