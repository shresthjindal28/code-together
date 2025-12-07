"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useUser } from "@clerk/nextjs";
import { getSocket } from "@/lib/socket";
import PresenceBar from "@/components/PresenceBar";
import EditorToolbar from "@/components/EditorToolbar";
import AISidebar from "@/components/AISidebar";
import type { Socket } from "socket.io-client";

type Props = {
  initialHtml: string;
  roomId: string;
  isOwner: boolean;
};

type CursorSelection = { from: number; to: number };
type CursorPosition = { left: number; top: number };
type RemoteUser = {
  id: string;
  name: string;
  color: string;
  isTyping: boolean;
  selection?: CursorSelection | null;
  cursor?: CursorPosition | null;
};

export default function Editor({ initialHtml, roomId, isOwner }: Props) {
  const { user } = useUser();

  const socketRef = useRef<Socket | null>(null);
  const hasHydratedFromServer = useRef(false);

  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("join-room", {
      roomId,
      user: {
        id: user.id,
        name: user.fullName || user.username || "User",
        color: "#ff4444",
        isOwner,
      },
    });

    return () => {
      socket.emit("leave-room", { roomId });
    };
  }, [user, roomId, isOwner]);

  useEffect(() => {
    if (!editor) return;
    if (hasHydratedFromServer.current) return;

    hasHydratedFromServer.current = true;
    editor.commands.setContent(initialHtml);
  }, [editor, initialHtml]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !editor) return;

    const init = (p: { html: string }) => {
      if (!p?.html) return;
      editor.commands.setContent(p.html, false);
    };

    socket.on("editor-init", init);

    return () => {
      socket.off("editor-init", init);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const socket = socketRef.current;
    if (!socket || !user) return;

    const handler = () => {
      socket.emit("editor-update", {
        roomId,
        html: editor.getHTML(),
        userId: user.id,
      });
    };

    editor.on("update", handler);

    return () => {
      editor.off("update", handler);
    };
  }, [editor, roomId, user]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !editor || !user) return;

    const recv = (p: { html: string; userId: string }) => {
      if (p.userId === user.id) return;
      editor.commands.setContent(p.html, false);
    };

    socket.on("editor-update", recv);

    return () => {
      socket.off("editor-update", recv);
    };
  }, [editor, user, roomId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !editor || !user) return;

    const sendCursor = () => {
      const { from, to, empty } = editor.state.selection;

      socket.emit("cursor-update", {
        roomId,
        userId: user.id,
        name: user.fullName || user.username || "User",
        color: "#ff4444",
        selection: empty ? null : { from, to },
        isTyping: !empty,
      });
    };

    editor.on("selectionUpdate", sendCursor);
    editor.on("transaction", sendCursor);

    return () => {
      editor.off("selectionUpdate", sendCursor);
      editor.off("transaction", sendCursor);
    };
  }, [editor, user, roomId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user) return;

    const presence = (p: { users: RemoteUser[] }) => {
      setRemoteUsers(p.users.filter((u) => u.id !== user.id));
    };

    socket.on("presence-state", presence);

    return () => {
      socket.off("presence-state", presence);
    };
  }, [user]);

  const usersWithCursor = useMemo(() => {
    if (!editor) return remoteUsers;

    return remoteUsers.map((u) => {
      if (!u.selection?.from) return u;
      try {
        const pos = u.selection.from;
        const coords = editor.view.coordsAtPos(pos);
        const rect = editor.view.dom.getBoundingClientRect();
        return {
          ...u,
          cursor: {
            left: coords.left - rect.left,
            top: coords.top - rect.top,
          },
        };
      } catch {
        return u;
      }
    });
  }, [editor, remoteUsers]);

  if (!editor) return null;

  return (
    <div
      className="w-full max-w-[1400px] mx-auto min-h-screen py-4 sm:py-6 px-3 sm:px-6 bg-gradient-to-br from-[#020316] via-[#05030f] to-[#020204] rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.45)]"
    >
      <div className="overflow-x-auto">
        <PresenceBar users={remoteUsers} />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] gap-4 md:gap-6">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-2 sm:p-3 bg-[#0b0d25]/40 backdrop-blur-xl border border-white/10">
            <EditorToolbar editor={editor} />
          </div>

          <div className="relative border border-white/10 bg-[#080a20]/60 backdrop-blur-2xl rounded-2xl h-[58vh] sm:h-[68vh] md:h-[78vh] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <EditorContent
              editor={editor}
              className="h-full p-3 sm:p-6 md:p-8 prose prose-invert max-w-none leading-relaxed tracking-wide text-[15px] sm:text-[16px] md:text-[18px]"
              style={{
                fontFamily: "var(--font-stack)",
                letterSpacing: ".2px",
              }}
            />

            {usersWithCursor.map(
              (u) =>
                u.cursor && (
                  <div
                    key={u.id}
                    style={{ left: u.cursor.left, top: u.cursor.top }}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
                  >
                    <div
                      style={{ background: u.color }}
                      className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border border-white"
                    />
                    <span
                      className="hidden sm:inline text-[10px] sm:text-xs bg-[#0d0a19]/80 text-white px-2 mt-1 rounded-lg shadow"
                      style={{ fontFamily: "var(--font-bitcount)" }}
                    >
                      {u.name}
                    </span>
                  </div>
                )
            )}
          </div>
        </div>

        <div className="order-last md:order-none">
          <AISidebar editor={editor} />
        </div>
      </div>
    </div>
  );
}
