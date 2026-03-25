import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-noite/70"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "input-base",
            error && "border-coral/60 focus:ring-coral/30 focus:border-coral",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-coral font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
