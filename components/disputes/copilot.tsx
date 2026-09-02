"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "Why are we contesting this dispute?",
  "What evidence is missing?",
  "What is the strongest evidence?",
  "What contradicts the customer's claim?",
  "Summarise the customer conversation.",
];

export function CopilotPanel({ disputeId }: { disputeId: string }) {
  const [question, setQuestion] = useState(SUGGESTIONS[0] ?? "");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(q = question) {
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
    <div className="rounded-[var(--radius)] bg-surface p-5 hairline">
      <div className="text-sm text-ai">Case copilot</div>
      <p className="mt-1 text-xs text-muted">Answers use only this dispute. Citations stay internal.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((item) => (
          <button key={item} type="button" className="rounded-full px-2 py-1 text-[11px] hairline" onClick={() => { setQuestion(item); void ask(item); }}>
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Button onClick={() => ask()} disabled={loading}>{loading ? "…" : "Ask"}</Button>
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
