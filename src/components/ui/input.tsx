import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-input border border-cream-3 bg-cream-0 px-[15px] py-[13px]",
          "font-sans text-base text-ink outline-none",
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
Input.displayName = "Input";

export { Input };
