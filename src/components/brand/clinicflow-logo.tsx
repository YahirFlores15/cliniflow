import { cn } from "@/lib/utils";


type ClinicFlowLogoProps = {
    compact?: boolean;
    className?: string;
    iconClassName?: string;
    textClassName?: string;
};

export function ClinicFlowLogo({
    compact = false,
    className,
    iconClassName,
    textClassName,
}: ClinicFlowLogoProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-3",
                className
            )}
        >
            <span
                className={cn(
                    "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-white shadow-sm",
                    iconClassName
                )}
                aria-hidden="true"
            >
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    className="size-full"
                >
                    <rect
                        x="17"
                        y="8"
                        width="6"
                        height="24"
                        rx="3"
                        fill="currentColor"
                    />

                    <rect
                        x="8"
                        y="17"
                        width="24"
                        height="6"
                        rx="3"
                        fill="currentColor"
                    />

                    <path
                        d="M5 27H11L14 22L18 29L22 13L26 25L29 21H35"
                        stroke="#A7F3D0"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>

            {!compact ? (
                <span
                    className={cn(
                        "flex flex-col leading-none",
                        textClassName
                    )}
                >
                    <span className="text-lg font-bold tracking-tight text-foreground">
                        ClinicFlow
                    </span>

                    <span className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-foreground-muted">
                        Gestión clínica
                    </span>
                </span>
            ) : null}
        </div>
    );
}