"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useUser } from "@clerk/nextjs";
import { getSocket } from "@/lib/socket";

import PresenceBar from "@/components/PresenceBar";
import EditorToolbar from "@/components/EditorToolbar";
import AISidebar from "@/components/AISidebar";

type EditorProps = {
  initialHtml: string;
  roomId: string;
};

type RemoteUser = {
  id: string;
  name: string;
  color: string;
  isTyping: boolean;
};

export default function Editor({ initialHtml, roomId }: EditorProps) {
  const { user } = useUser();
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const hasHydratedFromDb = useRef(false);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  // connect + join room + send presence
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socketRef.current = socket;

    const payload = {
      roomId,
      user: {
        id: user.id,
        name: user.fullName || user.username || "User",
        color: "#ff4444",
        avatar: user.imageUrl,
      },
    };

    socket.emit("join-room", payload);

    return () => {
      socket.emit("leave-room", { roomId });
    };
  }, [roomId, user]);

  // initial content from DB once
  useEffect(() => {
    if (!editor || !initialHtml) return;
    if (hasHydratedFromDb.current) return;
    hasHydratedFromDb.current = true;

    editor.commands.setContent(initialHtml);
  }, [editor, initialHtml]);

  // listen to server-init doc (server-side doc state)
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !editor) return;

    const handleInit = (payload: { html: string }) => {
      if (!payload?.html) return;
      editor.commands.setContent(payload.html, false);
    };

    socket.on("editor-init", handleInit);
    return () => {
      socket.off("editor-init", handleInit);
    };
  }, [editor]);

  // send editor updates (text) to room
  useEffect(() => {
    if (!editor) return;
    const socket = socketRef.current;
    if (!socket || !user) return;

    const handler = () => {
      const html = editor.getHTML();
      socket.emit("editor-update", {
        roomId,
        html,
        userId: user.id,
      });
    };

    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, roomId, user]);

  // receive editor updates from others
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !editor || !user) return;

    const handler = (payload: { html: string; userId: string }) => {
      if (payload.userId === user.id) return;
      editor.commands.setContent(payload.html, false);
    };

    socket.on("editor-update", handler);
    return () => {
      socket.off("editor-update", handler);
    };
  }, [editor, user]);

  // send cursor + typing state
  useEffect(() => {
    if (!editor) return;
    const socket = socketRef.current;
    if (!socket || !user) return;

    const handleSelection = () => {
      const { from, to } = editor.state.selection;
      socket.emit("cursor-update", {
        roomId,
        userId: user.id,
        name: user.fullName || user.username || "User",
        color: "#ff4444",
        selection: { from, to },
        isTyping: !editor.state.selection.empty,
      });
    };

    editor.on("selectionUpdate", handleSelection);
    editor.on("transaction", handleSelection);

    return () => {
      editor.off("selectionUpdate", handleSelection);
      editor.off("transaction", handleSelection);
    };
  }, [editor, roomId, user]);

  // receive presence + cursor info
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user) return;

    const handlePresence = (payload: { users: RemoteUser[] }) => {
      setRemoteUsers(
        payload.users.filter((u) => u.id !== user.id)
      );
    };

    const handleCursor = (payload: {
      userId: string;
      name: string;
      color: string;
      isTyping: boolean;
    }) => {
      setRemoteUsers((prev) => {
        const existing = prev.find((u) => u.id === payload.userId);
        if (!existing) {
          return [
            ...prev,
            {
              id: payload.userId,
              name: payload.name,
              color: payload.color,
              isTyping: payload.isTyping,
            },
          ];
        }
        return prev.map((u) =>
          u.id === payload.userId
            ? { ...u, isTyping: payload.isTyping }
            : u
        );
      });
    };

    socket.on("presence-state", handlePresence);
    socket.on("cursor-update", handleCursor);

    return () => {
      socket.off("presence-state", handlePresence);
      socket.off("cursor-update", handleCursor);
    };
  }, [user]);

  // autosave to DB
  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      const html = editor.getHTML();
      fetch("/api/save", {
        method: "POST",
        body: JSON.stringify({ roomId, html }),
      }).catch(() => {});
    };

    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, roomId]);

  if (!editor) return null;

  return (
    <div className="w-[77vw]">
      <PresenceBar remoteUsers={remoteUsers} />

      <EditorToolbar editor={editor} />

      <div className="relative">
        <EditorContent className="border rounded-2xl h-[80vh] w-full p-8" editor={editor} /> 
      </div>

      <AISidebar editor={editor} />
    </div>
  );
}
