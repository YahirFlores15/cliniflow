import { cva, type VariantProps, } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode, } from "react";
import { cn } from "@/lib/utils";


const buttonVariants = cva(
    [
        "inline-flex items-center justify-center gap-2",
        "whitespace-nowrap font-semibold",
        "transition duration-200",
        "focus-visible:outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    ],
    {
        variants: {
            variant: {
                primary:
                    "bg-primary text-white shadow-sm hover:bg-primary-hover",
                secondary:
                    "bg-secondary text-white shadow-sm hover:bg-secondary-hover",
                outline:
                    "border border-border-strong bg-surface text-foreground hover:border-primary-border hover:bg-primary-soft hover:text-primary",
                ghost:
                    "bg-transparent text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                danger:
                    "bg-danger text-white shadow-sm hover:bg-danger-hover",
                warning:
                    "bg-warning text-white shadow-sm hover:bg-warning-hover",
            },
            size: {
                sm: "h-9 rounded-lg px-3 text-sm",
                md: "h-11 rounded-xl px-4 text-sm",
                lg: "h-12 rounded-xl px-5 text-base",
                icon: "size-10 rounded-xl",
            },
            fullWidth: {
                true: "w-full",
                false: "",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
            fullWidth: false,
        },
    }
);

export type ButtonProps =
    ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
        children?: ReactNode;
    };

export function Button({
    className,
    variant,
    size,
    fullWidth,
    type = "button",
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                buttonVariants({
                    variant,
                    size,
                    fullWidth,
                }),
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export {
    buttonVariants,
};