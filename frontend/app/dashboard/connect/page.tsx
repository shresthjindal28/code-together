'use client'

import { useRouter } from 'next/navigation'
import { v4 as uuid } from 'uuid'

export default function ConnectPage() {
  const router = useRouter()

  const start = () => {
    const room = uuid()
    router.push(`/dashboard/connect/${room}`)
  }

  return (
    <div className="p-10 text-white">

      <h1
        className="text-3xl mb-6"
        style={{ fontFamily:"var(--font-science)" }}
      >
        Connect & Call
      </h1>

      <p className="text-neutral-400 max-w-md">
        Start a real-time video call using WebRTC and Socket.IO. 
        You can share the room link with another user.
      </p>

      <button
        onClick={start}
        className="mt-6 px-5 py-3 bg-green-600 hover:bg-green-500 rounded-lg"
        style={{ fontFamily:"var(--font-stack)" }}
      >
        Start New Call
      </button>
    </div>
  )
}
