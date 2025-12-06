"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  aiRewriteTone,
  aiGrammarFix,
  aiSummarize,
  aiExplainSelection,
  exportDocToPdf,
} from "@/app/actions/editorAI";

type Props = {
  editor: Editor | null;
};

export default function EditorToolbar({ editor }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!editor) return null;

  const getSelectionOrDoc = () => {
    const { from, to } = editor.state.selection;
    if (from !== to) {
      return editor.state.doc.textBetween(from, to, "\n");
    }
    return editor.state.doc.textBetween(0, editor.state.doc.content.size, "\n");
  };

  const replaceSelectionOrDoc = (text: string) => {
    const { from, to } = editor.state.selection;
    if (from !== to) {
      editor.chain().focus().insertContentAt({ from, to }, text).run();
    } else {
      editor.commands.setContent(text);
    }
  };

  const handleTone = async (
    tone: "neutral" | "formal" | "casual" | "friendly"
  ) => {
    setLoading(`tone-${tone}`);
    try {
      const text = getSelectionOrDoc();
      const rewritten = await aiRewriteTone(text, tone);
      if (rewritten) replaceSelectionOrDoc(rewritten);
    } finally {
      setLoading(null);
    }
  };

  const handleGrammar = async () => {
    setLoading("grammar");
    try {
      const text = getSelectionOrDoc();
      const fixed = await aiGrammarFix(text);
      if (fixed) replaceSelectionOrDoc(fixed);
    } finally {
      setLoading(null);
    }
  };

  const handleSummary = async () => {
    setLoading("summary");
    try {
      const text = getSelectionOrDoc();
      const summary = await aiSummarize(text);
      if (!summary) return;
      editor
        .chain()
        .focus()
        .insertContent(`\n\n**Summary:**\n${summary}\n`)
        .run();
    } finally {
      setLoading(null);
    }
  };

  const handleExplain = async () => {
    setLoading("explain");
    try {
      const text = getSelectionOrDoc();
      const explained = await aiExplainSelection(text);
      if (!explained) return;
      editor
        .chain()
        .focus()
        .insertContent(
          `\n\n> 💡 Explanation:\n> ${explained.replace(/\n/g, "\n> ")}\n`
        )
        .run();
    } finally {
      setLoading(null);
    }
  };

  const handleExportPdf = async () => {
    setLoading("pdf");
    try {
      const text = editor.state.doc.textBetween(
        0,
        editor.state.doc.content.size,
        "\n"
      );
      const base64 = await exportDocToPdf(text);
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64}`;
      link.download = "document.pdf";
      link.click();
    } finally {
      setLoading(null);
    }
  };

  const btn = (
    id: string,
    label: string,
    onClick: () => void,
    variant: "default" | "ghost" = "ghost"
  ) => (
    <button
      key={id}
      onClick={onClick}
      disabled={!!loading}
      className={`px-2 py-1 text-xs rounded-md border border-border/60 ${
        variant === "default"
          ? "bg-primary text-primary-foreground"
          : "bg-background/60 text-foreground hover:bg-accent"
      }`}
    >
      {loading === id ? "…" : label}
    </button>
  );

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-[#050509] px-3 py-2 shadow-sm">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
        AI Tools
      </span>
      <div className="h-4 w-px bg-border mx-1" />
      {btn("tone-neutral", "Neutral", () => handleTone("neutral"))}
      {btn("tone-formal", "Formal", () => handleTone("formal"))}
      {btn("tone-casual", "Casual", () => handleTone("casual"))}
      {btn("tone-friendly", "Friendly", () => handleTone("friendly"))}
      {btn("grammar", "Grammar Fix", handleGrammar)}
      {btn("summary", "Summarize", handleSummary)}
      {btn("explain", "Explain 💡", handleExplain)}
      <div className="ml-auto flex items-center gap-2">
        {btn("pdf", "Export PDF", handleExportPdf, "default")}
      </div>
    </div>
  );
}
