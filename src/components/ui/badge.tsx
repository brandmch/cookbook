import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-mono text-[11px] tracking-[.04em] uppercase px-2 py-0.5 rounded-[3px]",
  {
    variants: {
      variant: {
        default: "bg-accent-soft text-accent-ink",
        secondary: "bg-secondary-soft text-[#4d5733]",
        honey: "bg-honey/20 text-honey",
        outline: "border border-cream-3 text-ink-soft",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
