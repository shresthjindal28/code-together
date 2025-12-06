"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";

type SlashCommand = {
  label: string;
  description: string;
  action: () => void;
};

export default function SlashCommandMenu({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!editor) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement === document.body) {
        return;
      }
      if (e.key === "/") {
        setOpen(true);
        setFilter("");
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [editor]);

  if (!editor) return null;

  const commands: SlashCommand[] = [
    {
      label: "Heading 1",
      description: "Turn current line into H1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Bullet List",
      description: "Start a bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Code Block",
      description: "Start a code block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: "AI: Explain selection",
      description: "Explain the selected text or code",
      action: () => {
        editor.chain().focus().run();
      },
    },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(filter.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed left-1/2 top-20 -translate-x-1/2 z-50 w-80 rounded-md border bg-background shadow-lg text-sm">
      <div className="border-b px-2 py-1">
        <input
          autoFocus
          className="w-full bg-transparent text-xs outline-none"
          placeholder="Type a command…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="max-h-60 overflow-auto">
        {filtered.map((cmd) => (
          <button
            key={cmd.label}
            className="w-full text-left px-3 py-2 hover:bg-accent"
            onClick={() => {
              cmd.action();
              setOpen(false);
            }}
          >
            <div className="font-medium">{cmd.label}</div>
            <div className="text-[11px] text-muted-foreground">
              {cmd.description}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            No commands found.
          </div>
        )}
      </div>
    </div>
  );
}
