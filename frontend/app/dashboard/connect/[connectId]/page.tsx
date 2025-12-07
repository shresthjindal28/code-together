import CallRoom from "./room"

export default async function CallPage({
  params,
}: {
  params: Promise<{ connectId: string }>
}) {
  const { connectId } = await params
  return <CallRoom roomId={connectId} />
}
