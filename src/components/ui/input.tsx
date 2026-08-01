import type { InputHTMLAttributes, ReactNode, } from "react";
import { cn } from "@/lib/utils";


export type InputProps =
    InputHTMLAttributes<HTMLInputElement> & {
        leadingIcon?: ReactNode;
        trailingElement?: ReactNode;
        hasError?: boolean;
    };

export function Input({
    className,
    leadingIcon,
    trailingElement,
    hasError = false,
    ...props
}: InputProps) {
    return (
        <div className="relative">
            {leadingIcon ? (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-foreground-muted">
                    {leadingIcon}
                </div>
            ) : null}

            <input
                className={cn(
                    "h-12 w-full rounded-xl border bg-surface px-4 text-sm text-foreground shadow-sm outline-none transition duration-200",
                    "placeholder:text-foreground-muted/70",
                    "hover:border-border-strong",
                    "focus:border-primary focus:ring-4 focus:ring-primary/10",
                    "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
                    leadingIcon && "pl-11",
                    trailingElement && "pr-12",
                    hasError
                        ? "border-danger focus:border-danger focus:ring-danger/10"
                        : "border-border-strong",
                    className
                )}
                {...props}
            />

            {trailingElement ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    {trailingElement}
                </div>
            ) : null}
        </div>
    );
}