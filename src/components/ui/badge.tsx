import { cva, type VariantProps, } from "class-variance-authority";
import type { HTMLAttributes, ReactNode, } from "react";
import { cn } from "@/lib/utils";


const badgeVariants = cva(
    [
        "inline-flex w-fit items-center gap-1.5",
        "rounded-full border px-2.5 py-1",
        "text-xs font-semibold",
    ],
    {
        variants: {
            variant: {
                neutral:
                    "border-border bg-surface-muted text-foreground-muted",
                primary:
                    "border-primary-border bg-primary-soft text-primary",
                success:
                    "border-secondary-border bg-secondary-soft text-secondary",
                warning:
                    "border-warning-border bg-warning-soft text-warning-hover",
                danger:
                    "border-danger-border bg-danger-soft text-danger",
                info:
                    "border-primary-border bg-info-soft text-info",
            },
        },
        defaultVariants: {
            variant: "neutral",
        },
    }
);

type BadgeProps =
    HTMLAttributes<HTMLSpanElement> &
    VariantProps<typeof badgeVariants> & {
        children: ReactNode;
    };

export function Badge({
    className,
    variant,
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                badgeVariants({
                    variant,
                }),
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

export {
    badgeVariants,
};