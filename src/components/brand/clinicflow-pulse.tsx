import { cn } from "@/lib/utils";


type ClinicFlowPulseProps = {
    className?: string;
};

export function ClinicFlowPulse({
    className,
}: ClinicFlowPulseProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden",
                className
            )}
            aria-hidden="true"
        >
            <div className="absolute inset-x-0 top-1/2 h-px bg-primary-border" />

            <svg
                viewBox="0 0 520 96"
                fill="none"
                className="relative h-auto w-full"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient
                        id="clinicflow-pulse-gradient"
                        x1="0"
                        y1="0"
                        x2="520"
                        y2="0"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop
                            offset="0"
                            stopColor="#1A56DB"
                            stopOpacity="0"
                        />

                        <stop
                            offset="0.16"
                            stopColor="#1A56DB"
                        />

                        <stop
                            offset="0.72"
                            stopColor="#0E9F6E"
                        />

                        <stop
                            offset="1"
                            stopColor="#0E9F6E"
                            stopOpacity="0"
                        />
                    </linearGradient>
                </defs>

                <path
                    d="M0 49H68L92 49L112 33L136 67L162 49H210L229 49L245 17L270 79L294 49H344L365 49L382 36L401 60L421 49H520"
                    stroke="url(#clinicflow-pulse-gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-clinicflow-pulse-line"
                />

                <circle
                    cx="270"
                    cy="79"
                    r="4"
                    fill="#0E9F6E"
                />
            </svg>
        </div>
    );
}