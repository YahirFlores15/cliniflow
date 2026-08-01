import { AlertCircle, CheckCircle2, Info, } from "lucide-react";
import type { ReactNode, } from "react";
import { cn } from "@/lib/utils";


type ActionMessageVariant =
    | "success"
    | "error"
    | "info";

type ActionMessageProps = {
    variant: ActionMessageVariant;
    children: ReactNode;
    className?: string;
};

const VARIANT_STYLES: Record<
    ActionMessageVariant,
    string
> = {
    success:
        "border-secondary-border bg-secondary-soft text-secondary",
    error:
        "border-danger-border bg-danger-soft text-danger",
    info:
        "border-primary-border bg-primary-soft text-primary",
};

const VARIANT_ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
} as const;

export function ActionMessage({
    variant,
    children,
    className,
}: ActionMessageProps) {
    const Icon = VARIANT_ICONS[variant];

    return (
        <div
            role={
                variant === "error"
                    ? "alert"
                    : "status"
            }
            aria-live="polite"
            className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
                VARIANT_STYLES[variant],
                className
            )}
        >
            <Icon
                className="mt-0.5 size-4.5 shrink-0"
                strokeWidth={2}
            />

            <div className="min-w-0 leading-5">
                {children}
            </div>
        </div>
    );
}