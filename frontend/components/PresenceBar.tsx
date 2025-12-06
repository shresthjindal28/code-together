"use client";

type RemoteUser = {
  id: string;
  name: string;
  color: string;
  isTyping: boolean;
};

export default function PresenceBar({
  remoteUsers = [],
}: {
  remoteUsers?: RemoteUser[];
}) {
  if (!remoteUsers.length) {
    return (
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 text-xs text-neutral-400">
        <span>Only you in this room</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 text-xs">
      <div className="flex gap-2 items-center">
        {remoteUsers.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-1 rounded-full px-2 py-1 bg-neutral-900/80 border border-neutral-700"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: u.color }}
            />
            <span className="text-neutral-200">{u.name}</span>
            {u.isTyping && (
              <span className="text-[10px] text-neutral-400">
                typing…
              </span>
            )}
          </div>
        ))}
      </div>
      <span className="text-neutral-400">
        {remoteUsers.length + 1} people in this room
      </span>
    </div>
  );
}
