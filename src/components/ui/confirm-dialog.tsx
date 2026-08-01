"use client";

import {
    AlertTriangle,
    X,
} from "lucide-react";
import {
    useEffect,
    type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel?: string;
    variant?: "danger" | "primary";
    pending?: boolean;
    children?: ReactNode;
    onClose: () => void;
    onConfirm: () => void;
};

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel = "Cancelar",
    variant = "danger",
    pending = false,
    children,
    onClose,
    onConfirm,
}: ConfirmDialogProps) {
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

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            <button
                type="button"
                aria-label="Cerrar confirmación"
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-md animate-clinicflow-fade-in rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-lg)]">
                <div className="flex items-start justify-between gap-4">
                    <div
                        className={
                            variant === "danger"
                                ? "flex size-11 shrink-0 items-center justify-center rounded-2xl border border-danger-border bg-danger-soft text-danger"
                                : "flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary"
                        }
                    >
                        <AlertTriangle
                            className="size-5"
                            strokeWidth={1.9}
                        />
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Cerrar"
                        disabled={pending}
                        onClick={onClose}
                    >
                        <X className="size-5" />
                    </Button>
                </div>

                <h2
                    id="confirm-dialog-title"
                    className="mt-5 text-xl font-bold tracking-tight text-foreground"
                >
                    {title}
                </h2>

                <p
                    id="confirm-dialog-description"
                    className="mt-2 text-sm leading-6 text-foreground-muted"
                >
                    {description}
                </p>

                {children ? (
                    <div className="mt-4">
                        {children}
                    </div>
                ) : null}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={pending}
                        onClick={onClose}
                    >
                        {cancelLabel}
                    </Button>

                    <Button
                        type="button"
                        variant={
                            variant === "danger"
                                ? "danger"
                                : "primary"
                        }
                        disabled={pending}
                        onClick={onConfirm}
                    >
                        {pending
                            ? "Procesando..."
                            : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}