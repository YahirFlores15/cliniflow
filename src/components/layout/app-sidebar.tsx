"use client";

import {
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/server/auth/auth.actions";
import {
    ROLE_LABELS,
    type Role,
} from "@/shared/constants/roles";
import { ClinicFlowLogo } from "@/components/brand/clinicflow-logo";
import {
    ROLE_NAVIGATION,
    type NavigationItem,
} from "@/components/navigation/role-navigation";
import { Button } from "@/components/ui/button";
import {
    cn,
    getInitials,
} from "@/lib/utils";

type SidebarUser = {
    name: string;
    email: string;
    role: Role;
};

type AppSidebarProps = {
    user: SidebarUser;
    collapsed: boolean;
    mobileOpen: boolean;
    onToggleCollapsed: () => void;
    onCloseMobile: () => void;
};

function isNavigationItemActive(
    pathname: string,
    item: NavigationItem
): boolean {
    if (item.exact) {
        return pathname === item.href;
    }

    return (
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`)
    );
}

export function AppSidebar({
    user,
    collapsed,
    mobileOpen,
    onToggleCollapsed,
    onCloseMobile,
}: AppSidebarProps) {
    const pathname = usePathname();
    const navigationItems = ROLE_NAVIGATION[user.role];
    const initials = getInitials(user.name);

    return (
        <>
            <button
                type="button"
                aria-label="Cerrar navegación"
                className={cn(
                    "fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] transition-opacity lg:hidden",
                    mobileOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                )}
                onClick={onCloseMobile}
            />

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface shadow-[var(--shadow-lg)] transition-[width,transform] duration-300 lg:z-30 lg:translate-x-0 lg:shadow-none",
                    collapsed
                        ? "lg:w-20"
                        : "lg:w-72",
                    mobileOpen
                        ? "w-72 translate-x-0"
                        : "w-72 -translate-x-full"
                )}
            >
                <div
                    className={cn(
                        "flex h-20 shrink-0 items-center border-b border-border px-5",
                        collapsed
                            ? "lg:justify-center lg:px-3"
                            : "justify-between"
                    )}
                >
                    <Link
                        href={ROLE_NAVIGATION[user.role][0]?.href ?? "/"}
                        onClick={onCloseMobile}
                        aria-label="Ir al inicio de ClinicFlow"
                    >
                        <ClinicFlowLogo
                            compact={collapsed}
                            className={cn(
                                collapsed && "lg:justify-center"
                            )}
                        />
                    </Link>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        aria-label="Cerrar menú"
                        onClick={onCloseMobile}
                    >
                        <X className="size-5" />
                    </Button>
                </div>

                <nav className="cliniflow-scrollbar flex-1 overflow-y-auto px-3 py-5">
                    <p
                        className={cn(
                            "mb-3 px-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-foreground-muted",
                            collapsed && "lg:sr-only"
                        )}
                    >
                        Navegación
                    </p>

                    <ul className="flex flex-col gap-1.5">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const active = isNavigationItemActive(
                                pathname,
                                item
                            );

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onCloseMobile}
                                        title={
                                            collapsed
                                                ? item.label
                                                : undefined
                                        }
                                        className={cn(
                                            "group flex min-h-12 items-center rounded-xl border px-3 py-2.5 transition duration-200",
                                            collapsed
                                                ? "lg:justify-center lg:px-0"
                                                : "gap-3",
                                            active
                                                ? "border-primary-border bg-primary-soft text-primary shadow-sm"
                                                : "border-transparent text-foreground-muted hover:border-border hover:bg-surface-muted hover:text-foreground"
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "size-5 shrink-0",
                                                active
                                                    ? "text-primary"
                                                    : "text-foreground-muted group-hover:text-foreground"
                                            )}
                                            strokeWidth={1.9}
                                        />

                                        <span
                                            className={cn(
                                                "min-w-0 flex-1",
                                                collapsed &&
                                                "lg:hidden"
                                            )}
                                        >
                                            <span className="block truncate text-sm font-semibold">
                                                {item.label}
                                            </span>

                                            <span className="mt-0.5 block truncate text-xs text-foreground-muted">
                                                {item.description}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="border-t border-border p-3">
                    <div
                        className={cn(
                            "rounded-2xl border border-border bg-surface-muted p-3",
                            collapsed && "lg:p-2"
                        )}
                    >
                        <div
                            className={cn(
                                "flex items-center",
                                collapsed
                                    ? "lg:justify-center"
                                    : "gap-3"
                            )}
                        >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">
                                {initials}
                            </div>

                            <div
                                className={cn(
                                    "min-w-0 flex-1",
                                    collapsed && "lg:hidden"
                                )}
                            >
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {user.name}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-foreground-muted">
                                    {ROLE_LABELS[user.role]}
                                </p>
                            </div>
                        </div>

                        <div
                            className={cn(
                                "mt-3",
                                collapsed && "lg:mt-2"
                            )}
                        >
                            <form action={logoutAction}>
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size={
                                        collapsed
                                            ? "icon"
                                            : "sm"
                                    }
                                    fullWidth={!collapsed}
                                    title={
                                        collapsed
                                            ? "Cerrar sesión"
                                            : undefined
                                    }
                                    className={cn(
                                        "text-danger hover:bg-danger-soft hover:text-danger",
                                        collapsed &&
                                        "lg:mx-auto lg:flex"
                                    )}
                                >
                                    <LogOut className="size-4" />

                                    <span
                                        className={cn(
                                            collapsed && "lg:hidden"
                                        )}
                                    >
                                        Cerrar sesión
                                    </span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onToggleCollapsed}
                    aria-label={
                        collapsed
                            ? "Expandir navegación"
                            : "Contraer navegación"
                    }
                    className="absolute -right-3 top-24 hidden size-7 items-center justify-center rounded-full border border-border bg-surface text-foreground-muted shadow-[var(--shadow-sm)] transition hover:border-primary-border hover:bg-primary-soft hover:text-primary lg:flex"
                >
                    {collapsed ? (
                        <ChevronRight className="size-4" />
                    ) : (
                        <ChevronLeft className="size-4" />
                    )}
                </button>
            </aside>
        </>
    );
}