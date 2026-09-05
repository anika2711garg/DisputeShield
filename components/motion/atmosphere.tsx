"use client";

import { useEffect } from "react";

const MOTES = [
  ["12%", "18%", "0s"],
  ["78%", "12%", "1.2s"],
  ["64%", "72%", "0.4s"],
  ["28%", "64%", "2.1s"],
  ["91%", "48%", "1.7s"],
  ["44%", "36%", "2.8s"],
  ["8%", "82%", "0.9s"],
  ["82%", "88%", "3.1s"],
] as const;

export function PaperRoom() {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
      document.documentElement.style.setProperty("--my", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="paper-room" aria-hidden>
      {MOTES.map(([left, top, delay], index) => (
        <span key={index} className="paper-mote" style={{ left, top, animationDelay: delay }} />
      ))}
      <span className="lamp" />
      <span className="coffee" style={{ left: "6%", top: "14%" }} />
      <span className="coffee" style={{ right: "8%", bottom: "10%", width: 64, height: 64 }} />
      <span className="scrap" style={{ right: "4%", top: "22%" }} />
      <span className="scrap" style={{ left: "3%", bottom: "16%", transform: "rotate(-12deg)" }} />
    </div>
  );
}
