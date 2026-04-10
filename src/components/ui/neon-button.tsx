"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neonButtonVariants = cva(
  "relative group border text-foreground mx-auto text-center rounded-[0.875rem] transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[rgba(34,211,238,0.06)] hover:bg-[rgba(34,211,238,0.02)] border-[color:var(--aurora-cyan)]/25",
        solid:
          "bg-gradient-to-br from-[var(--aurora-cyan)] to-[var(--aurora-violet)] text-[#09090B] border-transparent hover:border-white/20 transition-all duration-200 font-semibold",
        ghost:
          "border-transparent bg-transparent hover:border-white/20 hover:bg-white/10",
      },
      size: {
        default: "px-7 py-1.5",
        sm: "px-4 py-0.5 text-sm",
        lg: "px-10 py-2.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {
  neon?: boolean;
}

const lineGradient =
  "linear-gradient(to right, transparent, var(--aurora-cyan), var(--aurora-violet), transparent)";

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, neon = true, size, variant, type = "button", children, ...props }, ref) => {
    return (
      <button
        className={cn(neonButtonVariants({ variant, size }), className)}
        ref={ref}
        type={type}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-[1] mx-auto hidden h-px w-3/4 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100",
            neon && "block"
          )}
          style={{ background: lineGradient, boxShadow: "0 0 10px var(--aurora-cyan)" }}
          aria-hidden
        />
        <span className="relative z-[2]">{children}</span>
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-[1] mx-auto hidden h-px w-3/4 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-30",
            neon && "block"
          )}
          style={{ background: lineGradient }}
          aria-hidden
        />
      </button>
    );
  }
);
NeonButton.displayName = "NeonButton";

export { NeonButton, neonButtonVariants };
