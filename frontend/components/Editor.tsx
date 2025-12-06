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
    <div className="w-[77vw]">
      <PresenceBar users={remoteUsers} />
      <EditorToolbar editor={editor} />

      <div className="relative border rounded-2xl h-[80vh] w-full">
        <EditorContent
          editor={editor}
          className="h-full p-8 prose prose-invert max-w-none"
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
                  className="h-3 w-3 rounded-full border"
                />
                <span className="text-xs bg-black/80 text-white px-1 mt-1 rounded">
                  {u.name}
                </span>
              </div>
            )
        )}
      </div>

      <AISidebar editor={editor} />
    </div>
  );
}
