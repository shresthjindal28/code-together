type PresenceUser = {
  id: string;
  name: string;
  color: string;
  isTyping: boolean;
  isOwner?: boolean;
};

export default function PresenceBar({ users = [] }: { users?: PresenceUser[] }) {
  if (!users.length) {
    return (
      <div className="mb-2 text-xs text-muted-foreground">
        Only you in this doc.
      </div>
    );
  }

  return (
    <div className="mb-2 flex items-center gap-2 text-xs">
      {users.map((u) => (
        <div
          key={u.id}
          className="flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-1 border border-neutral-700"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: u.color }}
          />
          <span>{u.name}</span>
          {u.isOwner && (
            <span className="text-[9px] uppercase tracking-wide text-amber-400">
              Owner
            </span>
          )}
          {u.isTyping && <span className="text-[10px] text-muted-foreground">typing…</span>}
        </div>
      ))}
    </div>
  );
}
