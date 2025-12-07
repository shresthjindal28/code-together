"use client"

import type { Stage } from "@/app/dashboard/connect/[connectId]/room"

type LobbyProps = {
  stage: Stage
  displayName: string
  setDisplayName: (name: string) => void
  onJoinAsHost: () => void
  onAskToJoin: () => void
}

export function Lobby({
  stage,
  displayName,
  setDisplayName,
  onJoinAsHost,
  onAskToJoin,
}: LobbyProps) {
  if (stage === "waiting") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <h2
            className="text-3xl"
            style={{ fontFamily: "var(--font-science)" }}
          >
            Waiting to join…
          </h2>
          <p className="text-neutral-300 text-sm">
            We&apos;ve notified the host. You&apos;ll join the call if they
            accept your request.
          </p>
          <p className="text-xs text-neutral-500">
            Keep this tab open. You can close this screen any time after you
            join.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-md w-full space-y-6 p-8 rounded-2xl bg-black/60 border border-white/10 shadow-xl">
        <h2
          className="text-3xl"
          style={{ fontFamily: "var(--font-science)" }}
        >
          Ready to join?
        </h2>
        <p
          className="text-neutral-300 text-sm"
          style={{ fontFamily: "var(--font-stack)" }}
        >
          Enter your name and choose whether you&apos;re starting the meeting
          as a host, or requesting to join an existing host.
        </p>

        <div className="space-y-2">
          <label
            className="text-xs uppercase tracking-[0.15em] text-neutral-400"
            style={{ fontFamily: "var(--font-bitcount)" }}
          >
            Your name
          </label>
          <input
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/10 text-sm outline-none focus:border-blue-500 transition"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onJoinAsHost}
            className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-medium transition"
          >
            Join as host
          </button>
          <button
            onClick={onAskToJoin}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium transition"
          >
            Ask to join
          </button>
        </div>

        <p className="text-[11px] text-neutral-500">
          Your name will be visible to everyone else in the call.
        </p>
      </div>
    </div>
  )
}
