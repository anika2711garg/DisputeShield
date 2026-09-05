"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Route } from "next";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eye } from "lucide-react";
import { cn, formatInr } from "@/lib/utils";
import { displayStatus, recommendationLabel, recommendationTone } from "@/lib/ui/labels";
import { deadlineUrgency, formatShortDate } from "@/lib/ui/dates";
import { Badge } from "@/components/ui/badge";
import { statusTone } from "@/lib/ui/tones";
import { CountUp } from "@/components/motion/primitives";
import type { CasePeekData } from "@/lib/ui/peek";

const WIDTH = 456;
const HEIGHT = 580;
const peekCache = new Map<string, CasePeekData>();

function prefetchPeek(id: string) {
  if (peekCache.has(id)) return;
  fetch(`/api/disputes/${id}/peek`)
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => {
      if (payload) peekCache.set(id, payload as CasePeekData);
    })
    .catch(() => undefined);
}

export function PeekTrigger({
  id,
  seed,
  className,
  children,
}: {
  id: string;
  seed?: Partial<CasePeekData>;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<CasePeekData | null>(() => peekCache.get(id) ?? null);
  const [trackedId, setTrackedId] = useState(id);
  if (id !== trackedId) {
    setTrackedId(id);
    setData(peekCache.get(id) ?? null);
  }
  const [pos, setPos] = useState({ top: 24, left: 24, flip: false });
  const anchor = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>(0);

  function place() {
    const box = anchor.current?.getBoundingClientRect();
    if (!box) return;
    const left = Math.min(window.innerWidth - WIDTH - 16, Math.max(12, box.left));
    const below = box.bottom + 10 + HEIGHT < window.innerHeight - 12;
    const top = below ? box.bottom + 10 : Math.max(12, box.top - HEIGHT - 10);
    setPos({ top, left, flip: !below });
  }

  function show() {
    prefetchPeek(id);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const cached = peekCache.get(id);
      if (cached) setData(cached);
      place();
      setOpen(true);
    }, 120);
  }

  function hide() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 180);
  }

  useEffect(() => {
    if (!open) return;
    if (peekCache.has(id)) return;
    let cancelled = false;
    fetch(`/api/disputes/${id}/peek`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload) {
          peekCache.set(id, payload as CasePeekData);
          setData(payload as CasePeekData);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onScroll = () => place();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <span ref={anchor} className={cn("peek-anchor inline-flex", className)} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  className="pointer-events-none fixed inset-0 z-40 bg-[#1c2421]/18"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <CasePeekCard
                  data={
                    data ?? {
                      id,
                      amount: seed?.amount ?? 0,
                      reason: seed?.reason ?? "",
                      status: seed?.status ?? "open",
                      ...seed,
                    }
                  }
                  loading={!data}
                  top={pos.top}
                  left={pos.left}
                  flip={pos.flip}
                  onEnter={show}
                  onLeave={hide}
                />
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </span>
  );
}

export function PeekLink({
  id,
  seed,
  href,
  className,
  children,
}: {
  id: string;
  seed?: Partial<CasePeekData>;
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <PeekTrigger id={id} seed={seed}>
      <Link href={(href ?? `/disputes/${id}`) as Route} className={className}>
        {children}
      </Link>
    </PeekTrigger>
  );
}

export function PeekButton({ id, seed }: { id: string; seed?: Partial<CasePeekData> }) {
  return (
    <PeekTrigger id={id} seed={seed}>
      <motion.button
        type="button"
        className="grid size-8 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-foreground"
        aria-label={`Peek ${id}`}
        whileHover={{ scale: 1.14, rotate: -8 }}
        whileTap={{ scale: 0.92 }}
      >
        <Eye className="size-3.5" />
      </motion.button>
    </PeekTrigger>
  );
}

function initials(name?: string) {
  if (!name) return "DS";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Fact({ label, value, mono, warn }: { label: string; value: string; mono?: boolean; warn?: boolean }) {
  return (
    <div className={cn("rounded-[12px] px-2.5 py-2", warn ? "peek-deadline-urgent" : "bg-sunken/70")}>
      <div className="peek-section-label">{label}</div>
      <div className={cn("mt-1 truncate text-[12px] leading-4", mono && "font-mono text-[11px]")}>{value}</div>
    </div>
  );
}

function CasePeekCard({
  data,
  loading,
  top,
  left,
  flip,
  onEnter,
  onLeave,
}: {
  data: CasePeekData;
  loading: boolean;
  top: number;
  left: number;
  flip: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const reduce = useReducedMotion();
  const label = displayStatus({
    status: data.status,
    phase: data.phase,
    recommendation: data.final,
  });
  const titleId = useId();
  const urgency = deadlineUrgency(data.respondBy);
  const score = data.score ?? 0;
  const stroke = score >= 80 ? "var(--emerald)" : score >= 50 ? "var(--amber)" : "var(--danger)";
  const circumference = 2 * Math.PI * 24;

  return (
    <motion.aside
      role="dialog"
      aria-labelledby={titleId}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: flip ? -12 : 16, scale: 0.95, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: flip ? -8 : 10, scale: 0.97, filter: "blur(4px)" }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{ top, left, width: WIDTH }}
      className="peek-card peek-wash fixed z-50 overflow-hidden rounded-[22px] shadow-[var(--shadow-hover)] hairline"
    >
      <motion.div className="peek-aurora h-1.5" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ transformOrigin: "left" }} />
      {loading && <div className="absolute inset-x-0 top-1.5 h-0.5 scan-ai" />}
      {score >= 80 && <div className="peek-sparkle pointer-events-none" aria-hidden />}

      <div className="max-h-[580px] space-y-4 overflow-auto p-4">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0.86, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-[13px] font-semibold text-white"
          >
            {initials(data.customerName)}
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <motion.div id={titleId} className="text-[15px] font-semibold tracking-tight" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
                  {data.customerName ?? data.id}
                </motion.div>
                <div className="mt-0.5 font-mono text-[10px] text-muted">{data.id}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge tone={statusTone(label)}>{label}</Badge>
                {data.hero && <Badge tone="ai">Hero file</Badge>}
              </div>
            </div>
            <p className="mt-1.5 text-[12px] leading-4 text-muted">
              {[
                data.customerEmail,
                data.customerPhone,
                data.addressLine ?? [data.city, data.state, data.country].filter(Boolean).join(", "),
                data.billingCity && data.billingCity !== data.city ? `billed ${data.billingCity}` : undefined,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-[16px] bg-sunken/60 px-3 py-3">
          <div className={cn("relative", score >= 80 && "glow-ring rounded-full")}>
            <svg width="76" height="76" viewBox="0 0 76 76" aria-label={`Score ${score}`}>
              <circle cx="38" cy="38" r="24" fill="none" stroke="var(--border)" strokeWidth="6" />
              <motion.circle
                cx="38"
                cy="38"
                r="24"
                fill="none"
                stroke={stroke}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                transform="rotate(-90 38 38)"
              />
              <text x="38" y="42" textAnchor="middle" fill="var(--text)" fontSize="14" fontWeight="650">
                {score || "—"}
              </text>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Amount at risk</p>
            <motion.p className="text-[28px] font-semibold leading-none tracking-tight tabular" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {data.amount ? <CountUp value={formatInr(data.amount)} /> : "—"}
            </motion.p>
            <p className="mt-1.5 text-xs capitalize text-muted">{data.reason || "Claim pending"}</p>
            {data.productName && (
              <p className="mt-0.5 text-[11px] text-foreground">
                {data.productName}
                {data.sku ? ` · ${data.sku}` : ""}
                {data.productCount && data.productCount > 1 ? ` · ${data.productCount} items` : ""}
              </p>
            )}
            {data.hoursLeft != null && (
              <p className={cn("mt-1 text-[11px]", urgency === "urgent" || urgency === "overdue" ? "text-danger" : "text-muted")}>
                {data.hoursLeft >= 0 ? `${data.hoursLeft}h left to respond` : `${Math.abs(data.hoursLeft)}h overdue`}
                {data.respondBy ? ` · ${formatShortDate(data.respondBy)}` : ""}
              </p>
            )}
          </div>
        </div>

        {data.timeline && data.timeline.length > 0 && (
          <div>
            <div className="peek-section-label mb-2">Journey</div>
            <div className="relative grid grid-cols-4 gap-1">
              <span className="absolute inset-x-5 top-[7px] h-px bg-border" />
              {data.timeline.slice(0, 4).map((point, index) => (
                <motion.div key={point.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index }} className="relative text-center">
                  <span className="mx-auto mb-1.5 block size-2 rounded-full bg-cyan" />
                  <div className="text-[10px] uppercase tracking-[0.1em] text-muted">{point.label}</div>
                  <div className="text-[11px]">{formatShortDate(point.at)}</div>
                  {point.detail && <div className="truncate text-[10px] text-muted">{point.detail}</div>}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="peek-section-label mb-2">Ledger</div>
          <div className="grid grid-cols-2 gap-2">
            <Fact label="Payment" value={data.paymentId ?? "—"} mono />
            <Fact label="Razorpay" value={data.razorpayDisputeId ?? "—"} mono />
            <Fact label="Order" value={data.orderId ?? data.razorpayOrderId ?? "—"} mono />
            <Fact label="Invoice" value={data.invoiceNumber ?? "—"} mono />
            <Fact label="Method" value={data.method ? `${data.method}${data.captured ? " · captured" : ""}` : "—"} />
            <Fact
              label="Paid vs claim"
              value={
                data.paymentAmount != null
                  ? `${formatInr(data.paymentAmount)}${data.amountMatch ? " · matches" : " · mismatch"}`
                  : "—"
              }
              warn={data.amountMatch === false}
            />
            <Fact label="Order status" value={data.orderStatus?.replaceAll("_", " ") ?? "—"} />
            <Fact label="Refunded" value={data.refunded ? formatInr(data.refunded) : "₹0"} />
          </div>
        </div>

        <div>
          <div className="peek-section-label mb-2">Fulfillment</div>
          <div className="grid grid-cols-2 gap-2">
            <Fact label="Tracking" value={data.trackingId ? `${data.carrier ?? ""} ${data.trackingId}`.trim() : "—"} mono />
            <Fact label="Shipment" value={data.shipmentStatus?.replaceAll("_", " ") ?? "—"} />
            <Fact
              label="Delivered"
              value={data.deliveredAt ? `${data.deliveryLocation ?? data.city ?? ""} · ${formatShortDate(data.deliveredAt)}`.trim() : "—"}
            />
            <Fact label="Recipient" value={data.recipientName ?? "—"} />
            <Fact label="Reason code" value={data.razorpayReason ?? data.reasonCode ?? "—"} mono />
            <Fact label="Owner" value={data.reviewer ?? "Unassigned"} />
          </div>
        </div>

        {data.dimensions && data.dimensions.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="peek-section-label">Evidence strength</div>
              {data.strengthAvg != null && <span className="text-[10px] text-muted">avg {data.strengthAvg}</span>}
            </div>
            <div className="space-y-1.5">
              {data.dimensions.slice(0, 6).map((item, index) => (
                <div key={item.key} className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <div>
                    <div className="mb-0.5 truncate text-[11px]">{item.label}</div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
                      <motion.div
                        className="h-1.5 rounded-full bg-gradient-to-r from-primary to-violet"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((item.awarded / Math.max(item.max, 1)) * 100)}%` }}
                        transition={{ duration: 0.5, delay: 0.07 * index }}
                      />
                    </div>
                  </div>
                  <span className="tabular text-[10px] text-muted">
                    {item.awarded}/{item.max}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.confidence != null && (
          <div>
            <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted">
              <span>AI confidence</span>
              <span>{Math.round(data.confidence * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
              <motion.div
                className="h-1.5 rounded-full bg-violet"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(data.confidence * 100)}%` }}
                transition={{ duration: 0.55, delay: 0.15 }}
              />
            </div>
          </div>
        )}

        <motion.div className="flex flex-wrap gap-1.5" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.045 } } }}>
          {[
            { tone: recommendationTone(data.ai), text: `AI ${recommendationLabel(data.ai)}` },
            { tone: recommendationTone(data.rules), text: `Rules ${recommendationLabel(data.rules)}` },
            ...(data.disagree ? [{ tone: "ai" as const, text: "AI ≠ rules" }] : []),
            ...(data.lastEvent ? [{ tone: "cyan" as const, text: data.lastEvent.replace("payment.dispute.", "") }] : []),
            ...(data.phase ? [{ tone: "muted" as const, text: data.phase.replaceAll("_", " ") }] : []),
            ...(data.approval ? [{ tone: "electric" as const, text: `Approval ${data.approval}` }] : []),
            ...(data.draftReady ? [{ tone: "emerald" as const, text: "Draft ready" }] : []),
            ...(data.evidenceCount != null
              ? [{ tone: "cyan" as const, text: `${data.verifiedCount ?? 0}/${data.evidenceCount} verified` }]
              : []),
          ].map((chip) => (
            <motion.span key={chip.text} variants={{ hidden: { opacity: 0, scale: 0.86 }, show: { opacity: 1, scale: 1 } }}>
              <Badge tone={chip.tone}>{chip.text}</Badge>
            </motion.span>
          ))}
        </motion.div>

        {data.evidenceTypes && data.evidenceTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.evidenceTypes.map((item, index) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index }}
                className="rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] capitalize text-cyan"
              >
                {item}
              </motion.span>
            ))}
          </div>
        )}

        {data.evidenceTitles && data.evidenceTitles.length > 0 && (
          <ul className="space-y-1.5">
            {data.evidenceTitles.map((title, index) => (
              <motion.li key={title} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * index }} className="flex items-center gap-2 text-[12px]">
                <span className="size-1.5 shrink-0 rounded-full bg-emerald" />
                <span className="truncate">{title}</span>
              </motion.li>
            ))}
          </ul>
        )}

        {data.missing && data.missing.length > 0 && <p className="text-[11px] text-amber">Missing: {data.missing.join(", ")}</p>}
        {data.overrides && data.overrides.length > 0 && <p className="text-[11px] text-muted">{data.overrides[0]}</p>}

        {data.quote && (
          <motion.blockquote initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="rounded-[14px] bg-violet/10 px-3.5 py-2.5 text-[13px] italic leading-5">
            “{data.quote}”
          </motion.blockquote>
        )}
        {data.lastMerchantNote && <p className="text-[11px] leading-4 text-muted">Merchant: {data.lastMerchantNote}</p>}
        {data.summary && <p className="text-[12px] leading-5 text-muted">{data.summary}</p>}
        {data.model && (
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
            {data.model}
            {data.latencyMs ? ` · ${data.latencyMs}ms` : ""}
            {data.reasonConfidence != null ? ` · reason ${Math.round(data.reasonConfidence * 100)}%` : ""}
            {data.messageCount != null ? ` · ${data.messageCount} messages` : ""}
          </p>
        )}

        {data.actions && data.actions.length > 0 && (
          <div>
            <div className="peek-section-label mb-1.5">Latest activity</div>
            <div className="space-y-1">
              {data.actions.map((item, index) => (
                <motion.div
                  key={`${item.action}-${item.at}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center justify-between gap-2 text-[11px]"
                >
                  <span>
                    <span className="mr-1.5 capitalize text-violet">{item.actor}</span>
                    {item.action}
                  </span>
                  <span className="text-muted">{formatShortDate(item.at)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <Link href={`/disputes/${data.id}` as Route} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          Open full case
          <motion.span aria-hidden animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
            →
          </motion.span>
        </Link>
      </div>
    </motion.aside>
  );
}
