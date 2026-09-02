import { useId } from "react";
import { cn } from "@/lib/utils";

export function BrandMark({ className, size = 32 }: { className?: string; size?: number }) {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="10" y1="8" x2="58" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F5C54" />
          <stop offset="1" stopColor="#1C2421" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path
        d="M32 12.5l16 7.2v13.2c0 11.4-7.6 19-16 21.9-8.4-2.9-16-10.5-16-21.9V19.7L32 12.5z"
        fill="#0D3B36"
        stroke="#E0A46A"
        strokeWidth="1.6"
      />
      <path d="M23 33.2l7.2 7.2L42.6 27" stroke="#FFF8EE" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="47.5" cy="46.5" r="3.2" fill="#C17B45" />
    </svg>
  );
}

export function BrandLogo({
  className,
  size = 32,
  wordmark = true,
  invert,
}: {
  className?: string;
  size?: number;
  wordmark?: boolean;
  invert?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark size={size} />
      {wordmark && (
        <span className={cn("text-[15px] font-semibold tracking-tight", invert ? "text-white" : "text-foreground")}>
          DisputeShield
        </span>
      )}
    </span>
  );
}
