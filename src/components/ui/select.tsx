import type { SelectHTMLAttributes, } from "react";
import { ChevronDown, } from "lucide-react";
import { cn } from "@/lib/utils";


export type SelectProps =
    SelectHTMLAttributes<HTMLSelectElement> & {
        hasError?: boolean;
    };

export function Select({
    className,
    hasError = false,
    children,
    ...props
}: SelectProps) {
    return (
        <div className="relative">
            <select
                className={cn(
                    "h-12 w-full appearance-none rounded-xl border bg-surface px-4 pr-11 text-sm text-foreground shadow-sm outline-none transition duration-200",
                    "hover:border-border-strong",
                    "focus:border-primary focus:ring-4 focus:ring-primary/10",
                    "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
                    hasError
                        ? "border-danger focus:border-danger focus:ring-danger/10"
                        : "border-border-strong",
                    className
                )}
                {...props}
            >
                {children}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-foreground-muted">
                <ChevronDown
                    className="size-4"
                    strokeWidth={2}
                />
            </div>
        </div>
    );
}