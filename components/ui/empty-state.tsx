import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("sheet grid place-items-center rounded-[6px] px-6 py-16 text-center", className)}>
      <Inbox className="size-8 text-muted" aria-hidden />
      <h2 className="display mt-4 text-2xl italic">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
