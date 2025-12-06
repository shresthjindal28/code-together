import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Editor from "@/components/Editor"
import { getRoomById, loadDocument } from "@/app/actions/actions"

export default async function RoomPage(
  props: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await props.params

  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const room = await getRoomById(roomId)
  if (!room) redirect("/dashboard")

  const isOwner = room.owner_id === userId

  const html = await loadDocument(roomId)

  return (
    <Editor
      initialHtml={html}
      roomId={roomId}
      isOwner={isOwner}
    />
  )
}
