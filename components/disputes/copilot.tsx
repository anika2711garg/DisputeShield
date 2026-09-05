"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "Why is Contest recommended?",
  "What evidence is weakest?",
  "Explain the score.",
  "What changes if acknowledgement is excluded?",
];

export function CopilotPanel({ disputeId }: { disputeId: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(q = question) {
    if (!q.trim()) return;
    setLoading(true);
    const response = await fetch(`/api/disputes/${disputeId}/ask-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });
    const data = await response.json();
    setAnswer(data.answer ?? data.error ?? "Unavailable");
    setCitations(data.citations ?? []);
    setLoading(false);
  }

  return (
    <div className="sheet flutter rounded-[6px] p-5">
      <div className="text-sm font-medium">Ask about this case…</div>
      <p className="mt-1 text-xs text-muted">Answers stay on this dispute. AI interpretation only.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            className="ticket rounded-[4px] px-2.5 py-1 text-[11px]"
            onClick={() => {
              setQuestion(item);
              void ask(item);
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about this case…" />
        <Button onClick={() => ask()} disabled={loading}>
          {loading ? "…" : "Ask"}
        </Button>
      </div>
      {answer && (
        <div className="mt-3 text-sm">
          {answer}
          <div className="mt-2 text-xs text-muted">{citations.join(" · ")}</div>
        </div>
      )}
    </div>
  );
}
