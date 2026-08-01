"use client";

import {
    useState,
    type ReactNode,
} from "react";

import type { Role } from "@/shared/constants/roles";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { cn } from "@/lib/utils";

type AppShellUser = {
    name: string;
    email: string;
    role: Role;
};

type AppShellProps = {
    user: AppShellUser;
    children: ReactNode;
};

const SIDEBAR_STORAGE_KEY =
    "cliniflow_sidebar_collapsed";

function getInitialSidebarCollapsedState(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    return (
        window.localStorage.getItem(
            SIDEBAR_STORAGE_KEY
        ) === "true"
    );
}

export function AppShell({
    user,
    children,
}: AppShellProps) {
    const [
        sidebarCollapsed,
        setSidebarCollapsed,
    ] = useState<boolean>(
        getInitialSidebarCollapsedState
    );

    const [mobileOpen, setMobileOpen] =
        useState(false);

    function toggleSidebar(): void {
        setSidebarCollapsed((currentValue) => {
            const nextValue = !currentValue;

            window.localStorage.setItem(
                SIDEBAR_STORAGE_KEY,
                String(nextValue)
            );

            return nextValue;
        });
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppSidebar
                user={user}
                collapsed={sidebarCollapsed}
                mobileOpen={mobileOpen}
                onToggleCollapsed={toggleSidebar}
                onCloseMobile={() => setMobileOpen(false)}
            />

            <div
                className={cn(
                    "min-h-screen transition-[padding] duration-300",
                    sidebarCollapsed
                        ? "lg:pl-20"
                        : "lg:pl-72"
                )}
            >
                <AppTopbar
                    user={user}
                    sidebarCollapsed={sidebarCollapsed}
                    onOpenMobile={() => setMobileOpen(true)}
                    onToggleCollapsed={toggleSidebar}
                />

                <main className="min-w-0">
                    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}