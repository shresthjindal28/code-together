"use client"

import { useState, useRef, useEffect } from "react"
import type { Editor } from "@tiptap/react"
import { aiChatWithDoc } from "@/app/actions/editorAI"

type Msg = {
  role: "user" | "assistant"
  content: string
}

export default function AISidebar({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [listening, setListening] = useState(false)

  type MinimalRecognition = {
    continuous: boolean
    lang: string
    onstart: (() => void) | null
    onend: (() => void) | null
    onresult: ((event: unknown) => void) | null
    start: () => void
    stop: () => void
  }

  const recognitionRef = useRef<{ stop: () => void } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const micStop = () => {
    try {
      recognitionRef.current?.stop()
      setListening(false)
    } catch {}
  }

  useEffect(() => {
    return () => micStop()
  }, [])

  if (!editor) return null

  const scrollBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    })
  }

  const micStart = () => {
    micStop()

    const Recognition =
      (
        (window as unknown) as {
          SpeechRecognition?: new () => MinimalRecognition
          webkitSpeechRecognition?: new () => MinimalRecognition
        }
      ).SpeechRecognition ||
      (
        (window as unknown) as {
          SpeechRecognition?: new () => MinimalRecognition
          webkitSpeechRecognition?: new () => MinimalRecognition
        }
      ).webkitSpeechRecognition

    if (!Recognition) return alert("Speech not supported")

    const recog = new Recognition()
    recognitionRef.current = recog
    recog.continuous = true
    recog.lang = "en-US"

    recog.onstart = () => setListening(true)
    recog.onend = () => setListening(false)
    recog.onresult = (event: unknown) => {
      const e = event as {
        results: Array<{ 0: { transcript: string } }>
        resultIndex: number
      }
      const text = e?.results?.[e.resultIndex]?.[0]?.transcript
      if (text) setInput((v) => v + " " + text)
    }

    recog.start()
  }

  

  const send = async () => {
    micStop()

    const text = input.trim()
    if (!text) return

    const docText = editor.state.doc.textBetween(
      0,
      editor.state.doc.content.size,
      "\n"
    )

    const userMsg: Msg[] = [...messages, { role: "user", content: text }]
    setMessages(userMsg)
    setInput("")
    scrollBottom()

    const reply = await aiChatWithDoc(userMsg, docText)

    const next: Msg[] = [...userMsg, { role: "assistant", content: reply }]
    setMessages(next)
    scrollBottom()

    // 🔥 KEY LOGIC (always write if asked OR long text OR explanation)
    const shouldWrite =
      text.toLowerCase().includes("write") ||
      text.toLowerCase().includes("add") ||
      reply.length > 150 ||
      reply.toLowerCase().includes("explain") ||
      reply.toLowerCase().startsWith("here is")

    if (shouldWrite) {
      editor
        .chain()
        .focus()
        .insertContent("\n" + reply + "\n")
        .run()
    }
  }

  return (
    <>
      <button
        className="fixed bottom-4 right-4 z-40 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg"
        onClick={() => setOpen((x) => !x)}
      >
        {open ? "Close AI" : "AI Chat"}
      </button>

      {open && (
        <div className="fixed right-4 top-4 bottom-16 z-50 w-80 rounded-2xl bg-black/90 border border-white/10 p-3 flex flex-col text-sm">
          <div className="text-white font-semibold mb-2">AI Assistant</div>

          <div ref={scrollRef} className="flex-1 overflow-auto space-y-2 pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto bg-blue-600 text-white px-2 py-1 rounded-lg max-w-[75%]"
                    : "bg-neutral-800 text-neutral-200 px-2 py-1 rounded-lg max-w-[75%]"
                }
              >
                {m.content}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <input
              className="flex-1 p-2 rounded bg-neutral-900 text-white"
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />

            <button
              onClick={listening ? micStop : micStart}
              className={`px-2 rounded ${
                listening ? "bg-red-500" : "bg-neutral-700"
              }`}
            >
              🎤
            </button>

            <button
              onClick={send}
              className="px-3 bg-primary text-primary-foreground rounded"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
