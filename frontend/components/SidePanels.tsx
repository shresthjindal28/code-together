"use client"

import { RefObject } from "react"
import type { Participant, ChatMessage } from "@/app/dashboard/connect/[connectId]/room"
import { ParticipantsPanel } from "./ParticipantsPanel"
import { ChatPanel } from "@/components/ChatPanel"

type Props = {
  participants: Participant[]
  chatMessages: ChatMessage[]
  chatInput: string
  setChatInput: (val: string) => void
  sendChat: () => void
  chatEndRef: RefObject<HTMLDivElement | null> 
}

export function SidePanels({
  participants,
  chatMessages,
  chatInput,
  setChatInput,
  sendChat,
  chatEndRef,
}: Props) {
  return (
    <div className="w-80 h-full rounded-2xl bg-black/60 border border-white/10 flex flex-col overflow-hidden">
      <ParticipantsPanel participants={participants} />
      <ChatPanel
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendChat={sendChat}
        chatEndRef={chatEndRef}
      />
    </div>
  )
}
