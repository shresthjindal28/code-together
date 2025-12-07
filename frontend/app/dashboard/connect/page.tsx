"use client"

import { useRouter } from "next/navigation"
import { v4 as uuid } from "uuid"
import { useEffect, useState } from "react"
import { createRoom, getActiveRooms } from "@/app/actions/Callactions"

export default function ConnectPage() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState("")
  const [activeRooms, setActiveRooms] = useState<{ id: string }[]>([])

  const startCall = async () => {
    const room = uuid()
    await createRoom(room)
    router.push(`/dashboard/connect/${room}`)
  }

  const join = () => {
    if (!joinCode.trim()) return
    router.push(`/dashboard/connect/${joinCode.trim()}`)
  }

  useEffect(() => {
    getActiveRooms().then(setActiveRooms)
  }, [])

  return (
    <div className="w-[80vw] p-10 text-white space-y-10">
      <h1
        className="text-4xl mb-4"
        style={{ fontFamily: "var(--font-science)" }}
      >
        Meet-like Calls
      </h1>

      {/* Start meeting */}
      <section className="space-y-3">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-stack)" }}>
          Start a meeting
        </h2>
        <button
          onClick={startCall}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg"
        >
          New Meeting
        </button>
      </section>

      {/* Join with code */}
      <section className="space-y-3">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-stack)" }}>
          Join with a code
        </h2>
        <div className="flex gap-2">
          <input
            className="px-4 py-2 rounded bg-neutral-900 border border-white/10 flex-1"
            placeholder="Enter a code or link"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button
            onClick={join}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
          >
            Join
          </button>
        </div>
      </section>

      {/* Active calls */}
      <section>
        <h2 className="text-xl mb-3" style={{ fontFamily: "var(--font-stack)" }}>
          Active meetings
        </h2>
        <div className="space-y-3">
          {activeRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => router.push(`/dashboard/connect/${room.id}`)}
              className="p-3 rounded bg-neutral-900 border border-white/10 hover:bg-neutral-800 cursor-pointer transition"
            >
              Meeting {room.id.slice(0, 8)}
            </div>
          ))}
          {activeRooms.length === 0 && (
            <p className="text-neutral-400">No active meetings right now.</p>
          )}
        </div>
      </section>
    </div>
  )
}
