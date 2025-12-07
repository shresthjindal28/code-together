"use client"

import { Participant } from "@/app/dashboard/connect/[connectId]/room"

type Props = {
  participants: Participant[]
}

export function ParticipantsPanel({ participants }: Props) {
  return (
    <div className="p-4 border-b border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm"
          style={{ fontFamily: "var(--font-stack)" }}
        >
          Participants
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-300">
          {participants.length}
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {participants.map((p) => (
          <div
            key={p.id}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-sm">
              <div>{p.name}</div>
              {p.is_host && (
                <div className="text-[10px] text-green-400">Host</div>
              )}
            </div>
          </div>
        ))}
        {participants.length === 0 && (
          <p className="text-[12px] text-neutral-500">No one is in the call yet.</p>
        )}
      </div>
    </div>
  )
}
