import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[9px] text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] [&_svg]:transition-transform [&_svg]:duration-150 hover:[&_svg]:translate-x-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-[0_6px_16px_rgba(15,92,84,0.28)] hover:brightness-110",
        secondary: "bg-surface text-foreground hairline hover:border-[color-mix(in_srgb,var(--primary)_28%,var(--border))]",
        ghost: "hover:bg-sunken text-foreground",
        danger: "bg-danger text-white hover:brightness-110",
        outline: "hairline bg-transparent hover:bg-surface",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
