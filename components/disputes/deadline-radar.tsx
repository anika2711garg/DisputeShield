"use client";

import { useEffect, useState } from "react";

export function DeadlineRadar({ respondBy }: { respondBy?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const timeout = window.setTimeout(() => setNow(Date.now()), 0);
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(id);
    };
  }, []);
  if (!respondBy) return <div className="text-sm text-muted">No processor deadline on file</div>;
  if (now === null) return <div className="text-sm text-muted">Respond by {respondBy.slice(0, 16).replace("T", " ")}</div>;
  const remaining = new Date(respondBy).getTime() - now;
  if (remaining <= 0) return <div className="text-sm text-danger">Deadline passed</div>;
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const tone = hours < 6 ? "text-danger" : hours < 24 ? "text-amber" : "text-cyan";
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted">Respond by</div>
      <div className={`mt-1 font-mono text-2xl ${tone}`}>
        {String(hours).padStart(2, "0")}h {String(minutes).padStart(2, "0")}m
      </div>
    </div>
  );
}
