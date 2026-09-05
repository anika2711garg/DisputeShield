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
import type { CaseBundle } from "@/types/case";
import { formatShortDate } from "@/lib/ui/dates";

export function EvidenceGraph({
  bundle,
  investigating,
  evidence,
  claim,
}: {
  bundle?: CaseBundle;
  investigating?: boolean;
  evidence?: { id: string; title: string }[];
  claim?: string;
}) {
  const { nodes, edges } = useMemo(() => buildGraph(bundle, investigating, evidence, claim), [bundle, investigating, evidence, claim]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-muted">Evidence graph</h3>
        <span className="text-[11px] text-muted">Verified sources · strength on each node</span>
      </div>
      <div className="h-[380px] overflow-hidden rounded-[6px] bg-white hairline md:h-[420px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
        >
          <Background gap={22} color="var(--border)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

function buildGraph(
  bundle?: CaseBundle,
  investigating?: boolean,
  evidence?: { id: string; title: string }[],
  claim?: string,
): { nodes: Node[]; edges: Edge[] } {
  if (!bundle) {
    return fallbackGraph(evidence ?? [], claim ?? "Claim", investigating);
  }
  const payment = find(bundle, "payment");
  const invoice = find(bundle, "billing_proof");
  const ship = find(bundle, "shipping_proof");
  const delivery = find(bundle, "delivery_confirmation");
  const chat = find(bundle, "customer_communication");
  const nodes: Node[] = [
    node("payment", 20, 20, "Payment", bundle.payment?.razorpayPaymentId ?? "Captured", payment, investigating, "#0F5C54"),
    node("order", 260, 20, "Order", bundle.order?.externalId ?? "—", undefined, investigating, "#1A6B63"),
    node("invoice", 500, 20, "Invoice", bundle.invoice?.invoiceNumber ?? String(invoice?.metadata.invoiceNumber ?? "INV"), invoice, investigating, "#2A9D8F"),
    node("shipment", 140, 170, "Shipment", bundle.shipment ? `${bundle.shipment.provider} ${bundle.shipment.trackingId}` : "—", ship, investigating, "#3D8B7A"),
    node("delivery", 400, 170, "Delivery", bundle.shipment?.deliveredAt ? formatShortDate(bundle.shipment.deliveredAt) : "—", delivery, investigating, "#2D6A4F"),
    node("customer", 140, 320, "Customer", bundle.customer?.name ?? "—", undefined, investigating, "#6B6458"),
    node("chat", 400, 320, "Chat acknowledgement", chat?.contentText?.slice(0, 42) ?? "—", chat, investigating, "#B86B3D"),
  ];
  const edges: Edge[] = [
    edge("payment", "order", investigating),
    edge("order", "invoice", investigating),
    edge("payment", "shipment", investigating),
    edge("shipment", "delivery", investigating),
    edge("customer", "chat", investigating),
  ];
  return { nodes, edges };
}

function fallbackGraph(evidence: { id: string; title: string }[], claim: string, investigating?: boolean) {
  const nodes: Node[] = [
    {
      id: "claim",
      position: { x: 20, y: 140 },
      data: { label: `Claim\n${claim}` },
      style: style(false, investigating),
    },
  ];
  const edges: Edge[] = [];
  evidence.slice(0, 6).forEach((item, index) => {
    nodes.push({
      id: item.id,
      position: { x: 280, y: 16 + index * 72 },
      data: { label: item.title },
      style: style(true, investigating),
    });
    edges.push(edge("claim", item.id, investigating));
  });
  return { nodes, edges };
}

function find(bundle: CaseBundle, type: string) {
  return bundle.evidence.find((item) => item.type === type);
}

function node(
  id: string,
  x: number,
  y: number,
  title: string,
  subtitle: string,
  evidence?: { verified?: boolean; source?: string; createdAt?: string; strengthScore?: number },
  investigating?: boolean,
  accent = "#0F5C54",
): Node {
  const meta = evidence
    ? `${evidence.verified ? "Verified" : "Unverified"} · ${evidence.source ?? "merchant"} · ${formatShortDate(evidence.createdAt)} · ${evidence.strengthScore ?? "—"}`
    : "Linked record";
  return {
    id,
    position: { x, y },
    data: { label: `${title}\n${subtitle}\n${meta}` },
    style: style(Boolean(evidence?.verified ?? true), investigating, accent),
  };
}

function edge(source: string, target: string, investigating?: boolean): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    animated: Boolean(investigating),
    markerEnd: { type: MarkerType.ArrowClosed, color: "var(--cyan)" },
    style: { stroke: "var(--cyan)" },
  };
}

function style(verified: boolean, investigating?: boolean, accent = "#0F5C54") {
  return {
    width: 196,
    border: `1px solid ${verified ? accent : "var(--amber)"}`,
    borderRadius: 10,
    background: "var(--bg-elevated)",
    color: "var(--text)",
    fontSize: 11,
    padding: 8,
    whiteSpace: "pre-wrap" as const,
    boxShadow: investigating ? `0 0 0 3px ${accent}33` : "none",
  };
}
