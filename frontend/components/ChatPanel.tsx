"use client"

import { RefObject } from "react"
import { MessageSquare } from "lucide-react"
import type { ChatMessage } from "@/app/dashboard/connect/[connectId]/room"

type Props = {
  chatMessages: ChatMessage[]
  chatInput: string
  setChatInput: (val: string) => void
  sendChat: () => void
  chatEndRef: RefObject<HTMLDivElement | null>
}

export function ChatPanel({
  chatMessages,
  chatInput,
  setChatInput,
  sendChat,
  chatEndRef,
}: Props) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <MessageSquare size={16} />
        <span
          className="text-sm"
          style={{ fontFamily: "var(--font-stack)" }}
        >
          Chat
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
        {chatMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.self ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                m.self
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-100"
              }`}
            >
              {!m.self && (
                <div className="text-[10px] opacity-70 mb-0.5">{m.sender}</div>
              )}
              <div>{m.text}</div>
              <div className="text-[9px] opacity-60 mt-1 text-right">
                {m.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 text-xs outline-none border border-white/10 focus:border-blue-500 transition"
          placeholder="Send a message"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendChat()}
        />
        <button
          onClick={sendChat}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-[11px] font-medium"
        >
          Send
        </button>
      </div>
    </div>
  )
}
