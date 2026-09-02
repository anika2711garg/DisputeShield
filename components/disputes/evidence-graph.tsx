"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { EvidenceItem } from "@/types/domain";

export function EvidenceGraph({ evidence, claim }: { evidence: EvidenceItem[]; claim: string }) {
  const { nodes, edges } = useMemo(() => buildGraph(evidence, claim), [evidence, claim]);

  return (
    <div>
      <h3 className="mb-3 text-sm text-muted">Evidence graph</h3>
      <div className="h-[360px] overflow-hidden rounded-2xl bg-sunken hairline">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
        >
          <Background gap={20} color="var(--border)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <ul className="mt-4 space-y-1 text-sm text-muted">
        {evidence.map((item) => (
          <li key={item.id}>
            {item.id} — {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildGraph(evidence: EvidenceItem[], claim: string): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    {
      id: "claim",
      position: { x: 20, y: 140 },
      data: { label: `Claim\n${claim}` },
      style: nodeStyle("danger"),
    },
  ];
  const edges: Edge[] = [];
  const visible = evidence.slice(0, 6);
  visible.forEach((item, index) => {
    const tone = item.metadata.contradicts ? "amber" : "cyan";
    nodes.push({
      id: item.id,
      position: { x: 280, y: 16 + index * 72 },
      data: { label: `${item.id}\n${item.title}` },
      style: nodeStyle(tone),
    });
    edges.push({
      id: `claim-${item.id}`,
      source: "claim",
      target: item.id,
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--cyan)" },
      style: { stroke: "var(--cyan)" },
    });
  });
  return { nodes, edges };
}

function nodeStyle(tone: "cyan" | "amber" | "danger") {
  const border = tone === "cyan" ? "var(--cyan)" : tone === "amber" ? "var(--amber)" : "var(--danger)";
  return {
    width: 220,
    border: `1px solid ${border}`,
    borderRadius: 12,
    background: "var(--bg-elevated)",
    color: "var(--text)",
    fontSize: 12,
    padding: 10,
    whiteSpace: "pre-wrap" as const,
  };
}
