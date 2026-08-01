import type { HTMLAttributes, ReactNode, } from "react";
import { cn } from "@/lib/utils";


type CardProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
};

export function Card({
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-1.5 border-b border-border px-5 py-4 sm:px-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "text-base font-semibold text-foreground sm:text-lg",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardDescription({
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "text-sm leading-6 text-foreground-muted",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardContent({
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "px-5 py-5 sm:px-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardFooter({
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-3 border-t border-border px-5 py-4 sm:px-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}