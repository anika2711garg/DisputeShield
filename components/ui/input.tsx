import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-[4px] bg-white/80 px-3 text-sm text-foreground outline-none hairline transition duration-200 placeholder:text-muted focus:bg-white focus:ring-2 focus:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
