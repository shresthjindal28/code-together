"use client"

import { RefObject } from "react"
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff } from "lucide-react"

type PendingRequest = { name: string; requesterSocketId: string }

type CallAreaProps = {
  localVideo: RefObject<HTMLVideoElement | null>
  remoteVideo: RefObject<HTMLVideoElement | null>
  isScreenSharing: boolean
  isMicOn: boolean
  isCamOn: boolean
  inCall: boolean
  isHost: boolean
  pendingRequests: PendingRequest[]
  onToggleMic: () => void
  onToggleCamera: () => void
  onToggleScreenShare: () => void
  onEndCall: () => void
  onStartCall: () => void
  onAcceptRequest: (id: string) => void
  onDenyRequest: (id: string) => void
}

export function CallArea({
  localVideo,
  remoteVideo,
  isScreenSharing,
  isMicOn,
  isCamOn,
  inCall,
  isHost,
  pendingRequests,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
  onStartCall,
  onAcceptRequest,
  onDenyRequest,
}: CallAreaProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Meeting header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/40">
        <div>
          <h1
            className="text-sm uppercase tracking-[0.25em] text-neutral-400"
            style={{ fontFamily: "var(--font-bitcount)" }}
          >
            Live Session
          </h1>
          <p
            className="text-lg mt-1"
            style={{ fontFamily: "var(--font-stack)" }}
          >
            Collaborative Meet
          </p>
        </div>
        {isScreenSharing && (
          <div className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/60 text-[11px] text-blue-200">
            You&apos;re presenting your screen
          </div>
        )}
      </div>

      {/* Video grid */}
      <div className="flex-1 flex items-center justify-center px-6 pb-24 pt-4">
        <div className="grid grid-cols-2 gap-4 w-full max-w-5xl">
          <VideoTile
            ref={localVideo}
            label="You"
            isLocal
            isScreenSharing={isScreenSharing}
            muted
          />
          <VideoTile ref={remoteVideo} label="Remote" />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6">
        <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-black/70 border border-white/10 backdrop-blur-md shadow-2xl">
          <IconButton
            active={isMicOn}
            activeClass="bg-neutral-800"
            inactiveClass="bg-red-700"
            onClick={onToggleMic}
            icon={isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
          />
          <IconButton
            active={isCamOn}
            activeClass="bg-neutral-800"
            inactiveClass="bg-red-700"
            onClick={onToggleCamera}
            icon={isCamOn ? <Video size={18} /> : <VideoOff size={18} />}
          />
          <IconButton
            active={isScreenSharing}
            activeClass="bg-blue-700"
            inactiveClass="bg-neutral-800"
            onClick={onToggleScreenShare}
            icon={<MonitorUp size={18} />}
          />

          <div className="w-px h-7 bg-white/10 mx-1" />

          {isHost && (
            <button
              onClick={onStartCall}
              disabled={inCall}
              className="px-4 py-2 rounded-full text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 disabled:cursor-not-allowed transition"
              style={{ fontFamily: "var(--font-stack)" }}
            >
              {inCall ? "In call" : "Start call"}
            </button>
          )}

          <button
            onClick={onEndCall}
            className="ml-2 p-3 rounded-full bg-red-600 hover:bg-red-500 transition shadow-lg"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </div>

      {/* Waiting room */}
      {isHost && pendingRequests.length > 0 && (
        <div className="absolute right-6 bottom-28 w-72 p-4 rounded-2xl bg-black/80 border border-yellow-500/60 backdrop-blur-md shadow-xl">
          <h3
            className="mb-2 text-sm"
            style={{ fontFamily: "var(--font-stack)" }}
          >
            Waiting room
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pendingRequests.map((req) => (
              <div
                key={req.requesterSocketId}
                className="flex items-center justify-between gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-medium">{req.name}</div>
                  <div className="text-[10px] text-neutral-400">
                    requesting to join
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onAcceptRequest(req.requesterSocketId)}
                    className="px-2 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-[11px]"
                  >
                    Admit
                  </button>
                  <button
                    onClick={() => onDenyRequest(req.requesterSocketId)}
                    className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-[11px]"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type VideoTileProps = {
  label: string
  isLocal?: boolean
  isScreenSharing?: boolean
  muted?: boolean
}

const VideoTile = ({
  label,
  isLocal,
  isScreenSharing,
  muted,
  ...rest
}: VideoTileProps & { ref: React.Ref<HTMLVideoElement> }) => {
  return (
    <div className="relative aspect-video rounded-2xl bg-neutral-950 overflow-hidden border border-white/10 shadow-lg">
      <video
        {...rest}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs flex items-center gap-2">
        <span style={{ fontFamily: "var(--font-stack)" }}>{label}</span>
        {isLocal && isScreenSharing && (
          <span className="text-[10px] text-blue-300">Presenting</span>
        )}
      </div>
    </div>
  )
}

type IconButtonProps = {
  active: boolean
  activeClass: string
  inactiveClass: string
  onClick: () => void
  icon: React.ReactNode
}

function IconButton({
  active,
  activeClass,
  inactiveClass,
  onClick,
  icon,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-full transition shadow-sm ${
        active ? activeClass : inactiveClass
      }`}
    >
      {icon}
    </button>
  )
}
