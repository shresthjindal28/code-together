"use client"

import { useState } from "react"
import type { Editor } from "@tiptap/react"
import {
  aiRewriteTone,
  aiGrammarFix,
  aiSummarize,
  aiExplainSelection,
  exportDocToPdf,
} from "@/app/actions/editorAI"
import { suggestContinuation } from "@/app/actions/editorSuggest"

type Props = {
  editor: Editor | null
}

export default function EditorToolbar({ editor }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!editor) return null

  const getSelectionOrDoc = () => {
    const { from, to } = editor.state.selection
    if (from !== to) {
      return editor.state.doc.textBetween(from, to, "\n")
    }
    return editor.state.doc.textBetween(0, editor.state.doc.content.size, "\n")
  }

  const replaceSelectionOrDoc = (text: string) => {
    const { from, to } = editor.state.selection
    if (from !== to) {
      editor.chain().focus().insertContentAt({ from, to }, text).run()
    } else {
      editor.commands.setContent(text)
    }
  }

  const handleTone = async (tone: "neutral" | "formal" | "casual" | "friendly") => {
    setLoading(`tone-${tone}`)
    const text = getSelectionOrDoc()
    const rewritten = await aiRewriteTone(text, tone)
    if (rewritten) replaceSelectionOrDoc(rewritten)
    setLoading(null)
  }

  const handleGrammar = async () => {
    setLoading("grammar")
    const text = getSelectionOrDoc()
    const fixed = await aiGrammarFix(text)
    if (fixed) replaceSelectionOrDoc(fixed)
    setLoading(null)
  }

  const handleSummary = async () => {
    setLoading("summary")
    const text = getSelectionOrDoc()
    const summary = await aiSummarize(text)
    if (!summary) return
    editor.chain().focus().insertContent(`\n\n**Summary:**\n${summary}\n`).run()
    setLoading(null)
  }

  const handleExplain = async () => {
    setLoading("explain")
    const text = getSelectionOrDoc()
    const explained = await aiExplainSelection(text)
    if (!explained) return
    editor
      .chain()
      .focus()
      .insertContent(
        `\n\n> 💡 Explanation:\n> ${explained.replace(/\n/g, "\n> ")}\n`
      )
      .run()
    setLoading(null)
  }

  const handleAutocomplete = async () => {
    setLoading("autocomplete")
    const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, "\n")
    const suggestion = await suggestContinuation(text)
    if (!suggestion) return
    editor.chain().focus().insertContent(` ${suggestion}`).run()
    setLoading(null)
  }

  const handleExportPdf = async () => {
    setLoading("pdf")
    const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, "\n")
    const base64 = await exportDocToPdf(text)
    const link = document.createElement("a")
    link.href = `data:application/pdf;base64,${base64}`
    link.download = "document.pdf"
    link.click()
    setLoading(null)
  }

  const Btn = (id: string, label: string, onClick: () => void) => (
    <button
      key={id}
      disabled={!!loading}
      onClick={onClick}
      className={`flex-shrink-0 px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs border border-border/60 bg-background/40 hover:bg-accent transition ${
        loading === id ? "opacity-50" : ""
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="mb-3 rounded-xl border border-border/70 bg-[#050509]/80 px-3 py-2 backdrop-blur">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible whitespace-nowrap">
          <span className="text-[11px] uppercase font-semibold tracking-widest text-muted-foreground">
            AI Tools
          </span>

          <div className="mx-2 h-4 w-px bg-border" />

          {Btn("tone-neutral","Neutral",()=>handleTone("neutral"))}
          {Btn("tone-formal","Formal",()=>handleTone("formal"))}
          {Btn("tone-casual","Casual",()=>handleTone("casual"))}
          {Btn("tone-friendly","Friendly",()=>handleTone("friendly"))}
          {Btn("grammar","Grammar Fix",handleGrammar)}
          {Btn("summary","Summarize",handleSummary)}
          {Btn("explain","Explain 💡",handleExplain)}
          {Btn("autocomplete","Auto-complete ✨",handleAutocomplete)}
        </div>

        <div className="sm:ml-auto flex-shrink-0">
          <button
            onClick={handleExportPdf}
            disabled={!!loading}
            className="px-2.5 sm:px-3 py-1 rounded-md bg-primary text-primary-foreground text-[11px] sm:text-xs"
          >
            Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}
