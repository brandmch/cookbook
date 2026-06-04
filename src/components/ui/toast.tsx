"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 2600);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "fixed bottom-7 left-1/2 -translate-x-1/2 z-[80]",
        "flex items-center gap-2.5 px-5 py-3.5 rounded-[10px]",
        "bg-ink text-[#fbeede] font-slab font-medium text-[15px]",
        "shadow-[0_12px_30px_-10px_rgba(0,0,0,.5)]",
        "animate-[toastIn_.3s_cubic-bezier(.2,.7,.3,1)]"
      )}
    >
      <Check className="w-4 h-4 text-secondary shrink-0" />
      {message}
    </div>
  );
}
