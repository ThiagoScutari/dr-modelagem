import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-mar text-white hover:bg-mar-dark active:bg-mar-dark",
  secondary:
    "border-[1.5px] border-mar text-mar bg-transparent hover:bg-mar/5 active:bg-mar/10",
  ghost:
    "text-noite/60 bg-transparent hover:bg-noite/5 active:bg-noite/10",
  danger:
    "bg-coral text-white hover:bg-coral-dark active:bg-coral-dark",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium transition-colors tap-target disabled:opacity-60",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
