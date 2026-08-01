import type { TextareaHTMLAttributes, } from "react";
import { cn } from "@/lib/utils";


export type TextareaProps =
    TextareaHTMLAttributes<HTMLTextAreaElement> & {
        hasError?: boolean;
    };

export function Textarea({
    className,
    hasError = false,
    ...props
}: TextareaProps) {
    return (
        <textarea
            className={cn(
                "min-h-28 w-full resize-y rounded-xl border bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition duration-200",
                "placeholder:text-foreground-muted/70",
                "hover:border-border-strong",
                "focus:border-primary focus:ring-4 focus:ring-primary/10",
                "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
                hasError
                    ? "border-danger focus:border-danger focus:ring-danger/10"
                    : "border-border-strong",
                className
            )}
            {...props}
        />
    );
}