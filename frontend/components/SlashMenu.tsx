"use client";

import React from "react";

type Command = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

const COMMANDS: Command[] = [
  { id: "rewrite", name: "Rewrite", icon: "♻️", description: "Rewrite the selected text" },
  { id: "fix", name: "Fix Grammar", icon: "📝", description: "Correct grammar automatically" },
  { id: "shorter", name: "Shorter", icon: "🔽", description: "Make text shorter" },
  { id: "longer", name: "Longer", icon: "🔼", description: "Expand the text" },
  { id: "emoji", name: "Emoji Add", icon: "😄", description: "Add emojis and make fun" },
  { id: "summary", name: "Summarize", icon: "📌", description: "Generate summary" },
  { id: "continue", name: "Continue Writing", icon: "➡️", description: "Continue naturally" },
];

export default function SlashMenu({
  pos,
  visible,
  onSelect,
}: {
  pos: { top: number; left: number };
  visible: boolean;
  onSelect: (id: string) => void;
}) {
  if (!visible) return null;

  return (
    <div
      style={{
        top: pos.top + 20,
        left: pos.left,
      }}
      className="fixed bg-white shadow-xl rounded-lg border p-2 w-60 animate-fade z-[10000]"
    >
      {COMMANDS.map((cmd) => (
        <div
          key={cmd.id}
          onClick={() => onSelect(cmd.id)}
          className="flex gap-2 items-center p-2 hover:bg-gray-100 cursor-pointer rounded-md"
        >
          <span>{cmd.icon}</span>
          <div className="flex flex-col">
            <span className="font-medium">{cmd.name}</span>
            <span className="text-xs text-gray-500">{cmd.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

