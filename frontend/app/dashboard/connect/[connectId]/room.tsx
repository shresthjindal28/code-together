"use client"

import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  transports: ["websocket"]
})

export default function CallRoom({ roomId }: { roomId: string }) {
  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)
  const pc = useRef<RTCPeerConnection | null>(null)
  const localStream = useRef<MediaStream | null>(null)

  const [inCall, setInCall] = useState(false)

  async function startLocalVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    localStream.current = stream
    if (localVideo.current) localVideo.current.srcObject = stream
  }

  async function callUser() {
    pc.current = new RTCPeerConnection()

    localStream.current?.getTracks().forEach((track) =>
      pc.current?.addTrack(track, localStream.current!)
    )

    pc.current.ontrack = (event) => {
      if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0]
    }

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        })
      }
    }

    const offer = await pc.current.createOffer()
    await pc.current.setLocalDescription(offer)

    socket.emit("call-offer", { roomId, offer })
  }

  function listenEvents() {
    socket.emit("join-room", {
      roomId,
      user: {
        id: "video-user",
        name: "Video User",
        color: "blue",
      },
    })

    socket.on("call-offer", async ({ offer }) => {
      pc.current = new RTCPeerConnection()

      localStream.current?.getTracks().forEach((track) =>
        pc.current?.addTrack(track, localStream.current!)
      )

      pc.current.ontrack = (event) => {
        if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0]
      }

      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          })
        }
      }

      await pc.current.setRemoteDescription(offer)
      const answer = await pc.current.createAnswer()
      await pc.current.setLocalDescription(answer)
      socket.emit("call-answer", { roomId, answer })
    })

    socket.on("call-answer", async ({ answer }) => {
      await pc.current?.setRemoteDescription(answer)
    })

    socket.on("ice-candidate", async ({ candidate }) => {
      await pc.current?.addIceCandidate(candidate)
    })

    socket.on("end-call", () => {
      pc.current?.close()
      setInCall(false)
    })
  }

  function endCall() {
    socket.emit("end-call", { roomId })
    pc.current?.close()
    setInCall(false)
  }

  useEffect(() => {
    startLocalVideo()
    listenEvents()
  }, [])

  return (
    <div className="p-8 text-white">
      <div className="flex gap-4">
        <video ref={localVideo} autoPlay muted playsInline className="rounded-xl w-1/2 bg-black" />
        <video ref={remoteVideo} autoPlay playsInline className="rounded-xl w-1/2 bg-black" />
      </div>

      {!inCall && (
        <button
          onClick={() => {
            setInCall(true)
            callUser()
          }}
          className="mt-6 px-5 py-2 rounded-lg bg-green-600"
        >
          Start Call
        </button>
      )}

      {inCall && (
        <button
          onClick={endCall}
          className="mt-6 px-5 py-2 rounded-lg bg-red-600"
        >
          End Call
        </button>
      )}
    </div>
  )
}
