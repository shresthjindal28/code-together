"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { aiChatWithDoc } from "@/app/actions/editorAI";

type Msg = { role: "user" | "assistant"; content: string };

export default function AISidebar({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!editor) return null;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const docText = editor.state.doc.textBetween(
      0,
      editor.state.doc.content.size,
      "\n"
    );

    const newMessages = [...messages, { role: "user", content: text } as Msg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const answer = await aiChatWithDoc(newMessages, docText);

    // show in chat
    setMessages([...newMessages, { role: "assistant", content: answer } as Msg]);

    // ⭐ insert into actual editor
    editor.commands.insertContent("\n" + answer + "\n");

    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:scale-[1.02] transition"
      >
        {open ? "Close AI" : "AI Chat"}
      </button>

      {open && (
        <div className="fixed right-4 top-4 bottom-16 z-40 flex w-80 flex-col overflow-hidden rounded-xl border border-border/70 bg-[#050509] shadow-2xl">
          <div className="border-b border-border/60 px-3 py-2 text-sm font-semibold">
            AI Assistant
          </div>

          <div className="flex-1 space-y-2 overflow-auto px-3 py-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-2 py-1 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-xs text-muted-foreground">Thinking…</div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-border/60 p-2">
            <input
              className="flex-1 rounded-md border border-border/60 bg-background px-2 py-1 text-xs outline-none"
              placeholder="Ask anything about this doc…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
