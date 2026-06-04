import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-input border border-cream-3 bg-cream-0 px-[15px] py-[13px]",
          "font-sans text-base text-ink outline-none resize-none",
          "transition-[border-color,box-shadow] duration-150",
          "placeholder:text-ink-faint",
          "focus:border-accent focus:shadow-[0_0_0_3px_#ecc8b6]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
