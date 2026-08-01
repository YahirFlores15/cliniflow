"use client";

import { X } from "lucide-react";
import {
    useEffect,
    type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DrawerProps = {
    open: boolean;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
    onClose: () => void;
};

export function Drawer({
    open,
    title,
    description,
    children,
    footer,
    className,
    onClose,
}: DrawerProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(
            event: KeyboardEvent
        ): void {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.body.style.overflow =
                previousOverflow;
        };
    }, [open, onClose]);

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100]",
                open
                    ? "pointer-events-auto"
                    : "pointer-events-none"
            )}
            aria-hidden={!open}
        >
            <button
                type="button"
                aria-label="Cerrar panel lateral"
                onClick={onClose}
                className={cn(
                    "absolute inset-0 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-300",
                    open
                        ? "opacity-100"
                        : "opacity-0"
                )}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-title"
                aria-describedby={
                    description
                        ? "drawer-description"
                        : undefined
                }
                className={cn(
                    "absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-border bg-surface shadow-[var(--shadow-lg)] transition-transform duration-300 ease-out",
                    open
                        ? "translate-x-0"
                        : "translate-x-full",
                    className
                )}
            >
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
                    <div className="min-w-0">
                        <h2
                            id="drawer-title"
                            className="text-xl font-bold tracking-tight text-foreground"
                        >
                            {title}
                        </h2>

                        {description ? (
                            <p
                                id="drawer-description"
                                className="mt-1 text-sm leading-6 text-foreground-muted"
                            >
                                {description}
                            </p>
                        ) : null}
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Cerrar"
                        onClick={onClose}
                    >
                        <X className="size-5" />
                    </Button>
                </header>

                <div className="cliniflow-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
                    {children}
                </div>

                {footer ? (
                    <footer className="shrink-0 border-t border-border bg-surface px-5 py-4 sm:px-6">
                        {footer}
                    </footer>
                ) : null}
            </aside>
        </div>
    );
}