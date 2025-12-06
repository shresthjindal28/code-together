import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Editor from "@/components/Editor";
import { loadDocument } from "@/app/actions/actions";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const html = await loadDocument(roomId);

  return <Editor initialHtml={html} roomId={roomId} />;
}
