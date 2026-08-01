import { clsx, type ClassValue, } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
    const normalizedName = name.trim();

    if (!normalizedName) {
        return "CF";
    }

    return normalizedName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}