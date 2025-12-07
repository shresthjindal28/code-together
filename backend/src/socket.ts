import http from "http"
import { Server } from "socket.io"
import { createRedisClients } from "./redis"
import { createAdapter } from "@socket.io/redis-adapter"

type PresenceUser = {
  id: string
  name: string
  color: string
  isTyping: boolean
  isOwner?: boolean
}

type CursorSelection = {
  from: number
  to: number
}

const roomUsers = new Map<string, Map<string, PresenceUser>>()
const roomDocs = new Map<string, string>()
const roomOwners = new Map<string, string>()

const RATE_WINDOW_MS = 1000
const MAX_EVENTS_PER_WINDOW = 10

type RateState = {
  timestamps: number[]
}

export function setupSocket(server: http.Server, origin: string) {
  const io = new Server(server, {
    cors: { origin, credentials: true },
  })

  const { pubClient, subClient } = createRedisClients()
  if (pubClient && subClient) io.adapter(createAdapter(pubClient, subClient))

  io.on("connection", (socket) => {

    const rateState: RateState = { timestamps: [] }

    const checkRateLimit = (): boolean => {
      const now = Date.now()
      rateState.timestamps = rateState.timestamps.filter(
        (t) => now - t < RATE_WINDOW_MS
      )
      if (rateState.timestamps.length >= MAX_EVENTS_PER_WINDOW) return false
      rateState.timestamps.push(now)
      return true
    }

    socket.on("join-room", (payload: {
      roomId: string
      user: { id: string; name: string; color: string; isOwner?: boolean }
    }) => {
      const { roomId, user } = payload

      ;(socket.data as any).roomId = roomId
      ;(socket.data as any).userId = user.id

      socket.join(roomId)

      if (!roomOwners.has(roomId)) roomOwners.set(roomId, user.id)
      const ownerId = roomOwners.get(roomId)

      let users = roomUsers.get(roomId)
      if (!users) {
        users = new Map()
        roomUsers.set(roomId, users)
      }

      users.set(socket.id, {
        id: user.id,
        name: user.name,
        color: user.color,
        isTyping: false,
        isOwner: ownerId === user.id,
      })

      io.to(roomId).emit("presence-state", {
        users: Array.from(users.values()),
        ownerId,
      })

      if (roomDocs.has(roomId)) {
        socket.emit("editor-init", { html: roomDocs.get(roomId) })
      }
    })

    socket.on("editor-update", (payload: {
      roomId: string
      html: string
      userId: string
    }) => {
      if (!checkRateLimit()) return
      const { roomId, html, userId } = payload
      roomDocs.set(roomId, html)
      socket.to(roomId).emit("editor-update", { html, userId })
    })

    socket.on("cursor-update", (payload: {
      roomId: string
      userId: string
      selection: CursorSelection | null
      isTyping: boolean
    }) => {
      if (!checkRateLimit()) return

      const { roomId, userId, isTyping } = payload
      const users = roomUsers.get(roomId)

      if (users) {
        for (const [sockId, u] of users.entries()) {
          if (u.id === userId) users.set(sockId, { ...u, isTyping })
        }
        io.to(roomId).emit("presence-state", {
          users: Array.from(users.values()),
          ownerId: roomOwners.get(roomId),
        })
      }
      socket.to(roomId).emit("cursor-update", payload)
    })

    socket.on("leave-room", ({ roomId }: { roomId: string }) => {
      socket.leave(roomId)
      const users = roomUsers.get(roomId)
      if (users) {
        users.delete(socket.id)
        io.to(roomId).emit("presence-state", {
          users: Array.from(users.values()),
          ownerId: roomOwners.get(roomId),
        })
      }
    })

    socket.on("call-offer", (payload: { roomId: string; offer: any }) => {
      socket.to(payload.roomId).emit("call-offer", {
        offer: payload.offer,
        from: socket.id,
      })
    })

    socket.on("call-answer", (payload: { roomId: string; answer: any }) => {
      socket.to(payload.roomId).emit("call-answer", {
        answer: payload.answer,
        from: socket.id,
      })
    })

    socket.on("ice-candidate", (payload: { roomId: string; candidate: any }) => {
      socket.to(payload.roomId).emit("ice-candidate", {
        candidate: payload.candidate,
        from: socket.id,
      })
    })

    socket.on("end-call", (payload: { roomId: string }) => {
      socket.to(payload.roomId).emit("end-call")
    })

    socket.on("call-join-request", (payload: {
      roomId: string
      name: string
      requesterSocketId: string
    }) => {
      socket.to(payload.roomId).emit("call-join-request", payload)
    })

    socket.on("call-join-response", (payload: {
      roomId: string
      requesterSocketId: string
      approved: boolean
    }) => {
      io.to(payload.requesterSocketId).emit("call-join-response", payload)
    })

    socket.on(
      "call-chat",
      (payload: { roomId: string; name: string; text: string }) => {
        socket.to(payload.roomId).emit("call-chat", payload)
      }
    )

    socket.on(
      "call-media-state",
      (payload: { roomId: string; userId: string; mic: boolean; cam: boolean }) => {
        socket.to(payload.roomId).emit("call-media-state", payload)
      }
    )

    socket.on(
      "call-raise-hand",
      (payload: { roomId: string; userId: string; name: string }) => {
        socket.to(payload.roomId).emit("call-raise-hand", payload)
      }
    )

    socket.on(
      "call-screen-share",
      (payload: { roomId: string; userId: string; sharing: boolean }) => {
        socket.to(payload.roomId).emit("call-screen-share", payload)
      }
    )

    socket.on(
      "call-speaking",
      (payload: { roomId: string; userId: string }) => {
        socket.to(payload.roomId).emit("call-speaking", payload)
      }
    )

    socket.on("disconnect", () => {
      const roomId = (socket.data as any).roomId as string | undefined
      if (roomId) {
        const users = roomUsers.get(roomId)
        if (users) {
          users.delete(socket.id)
          io.to(roomId).emit("presence-state", {
            users: Array.from(users.values()),
            ownerId: roomOwners.get(roomId),
          })
        }
      }
    })
  })

  return io
}
