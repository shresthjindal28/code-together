import { NextResponse } from "next/server";
import { saveDocument } from "@/app/actions/actions";

export async function POST(req: Request) {
  try {
    const { roomId, html } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    await saveDocument(roomId, html);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/save error", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
