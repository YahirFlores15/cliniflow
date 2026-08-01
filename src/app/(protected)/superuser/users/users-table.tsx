"use client";

import {
    CheckCircle2,
    Edit3,
    Mail,
    Search,
    ShieldOff,
    UserCheck,
    UserPlus,
    UsersRound,
} from "lucide-react";
import Link from "next/link";
import {
    useActionState,
    useMemo,
    useRef,
    useState,
} from "react";

import { ActionMessage } from "@/components/feedback/action-message";
import { Badge } from "@/components/ui/badge";
import {
    buttonVariants,
    Button,
} from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    updateUserStatusAction,
    type SuperuserActionState,
} from "@/server/modules/superuser/superuser.actions";
import {
    ROLE_LABELS,
    ROLE_VALUES,
    type Role,
} from "@/shared/constants/roles";
import type { AdminUserDTO } from "@/shared/dtos/auth.dtos";

type UsersTableProps = {
    users: AdminUserDTO[];
    currentUserId: string;
    createdSuccessfully: boolean;
};

type StatusFilter =
    | "ALL"
    | "ACTIVE"
    | "INACTIVE";

type SelectedStatusChange = {
    user: AdminUserDTO;
    nextStatus: boolean;
};

const initialActionState: SuperuserActionState = {
    ok: false,
    message: "",
};

function formatDate(value: string): string {
    return new Intl.DateTimeFormat(
        "es-MX",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(new Date(value));
}

function normalizeSearchValue(
    value: string
): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export function UsersTable({
    users,
    currentUserId,
    createdSuccessfully,
}: UsersTableProps) {
    const [search, setSearch] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState<"ALL" | Role>("ALL");

    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("ALL");

    const [
        selectedStatusChange,
        setSelectedStatusChange,
    ] = useState<SelectedStatusChange | null>(
        null
    );

    const formRef =
        useRef<HTMLFormElement>(null);

    const [
        statusState,
        statusFormAction,
        statusPending,
    ] = useActionState(
        updateUserStatusAction,
        initialActionState
    );

    const filteredUsers = useMemo(() => {
        const normalizedSearch =
            normalizeSearchValue(search);

        return users.filter((user) => {
            const matchesSearch =
                !normalizedSearch ||
                normalizeSearchValue(
                    user.name
                ).includes(normalizedSearch) ||
                normalizeSearchValue(
                    user.email
                ).includes(normalizedSearch);

            const matchesRole =
                roleFilter === "ALL" ||
                user.role === roleFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" &&
                    user.isActive) ||
                (statusFilter === "INACTIVE" &&
                    !user.isActive);

            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus
            );
        });
    }, [
        users,
        search,
        roleFilter,
        statusFilter,
    ]);

    const hasActiveFilters =
        Boolean(search.trim()) ||
        roleFilter !== "ALL" ||
        statusFilter !== "ALL";

    function clearFilters(): void {
        setSearch("");
        setRoleFilter("ALL");
        setStatusFilter("ALL");
    }

    function confirmStatusChange(): void {
        formRef.current?.requestSubmit();
    }

    return (
        <div className="flex flex-col gap-5">
            {createdSuccessfully ? (
                <ActionMessage variant="success">
                    El usuario fue creado correctamente y ya aparece en el listado.
                </ActionMessage>
            ) : null}

            {statusState.message ? (
                <ActionMessage
                    variant={
                        statusState.ok
                            ? "success"
                            : "error"
                    }
                >
                    {statusState.message}
                </ActionMessage>
            ) : null}

            <Card>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                        <div className="min-w-0 flex-1">
                            <label
                                htmlFor="user-search"
                                className="mb-2 block text-sm font-semibold text-foreground"
                            >
                                Buscar usuario
                            </label>

                            <Input
                                id="user-search"
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                leadingIcon={
                                    <Search
                                        className="size-4.5"
                                        strokeWidth={1.9}
                                    />
                                }
                                placeholder="Nombre o correo electrónico"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:w-[420px]">
                            <div>
                                <label
                                    htmlFor="role-filter"
                                    className="mb-2 block text-sm font-semibold text-foreground"
                                >
                                    Rol
                                </label>

                                <Select
                                    id="role-filter"
                                    value={roleFilter}
                                    onChange={(event) =>
                                        setRoleFilter(
                                            event.target
                                                .value as
                                            | "ALL"
                                            | Role
                                        )
                                    }
                                >
                                    <option value="ALL">
                                        Todos los roles
                                    </option>

                                    {ROLE_VALUES.map(
                                        (role) => (
                                            <option
                                                key={role}
                                                value={role}
                                            >
                                                {
                                                    ROLE_LABELS[
                                                    role
                                                    ]
                                                }
                                            </option>
                                        )
                                    )}
                                </Select>
                            </div>

                            <div>
                                <label
                                    htmlFor="status-filter"
                                    className="mb-2 block text-sm font-semibold text-foreground"
                                >
                                    Estado
                                </label>

                                <Select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target
                                                .value as StatusFilter
                                        )
                                    }
                                >
                                    <option value="ALL">
                                        Todos los estados
                                    </option>

                                    <option value="ACTIVE">
                                        Activos
                                    </option>

                                    <option value="INACTIVE">
                                        Inactivos
                                    </option>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-foreground-muted">
                            Mostrando{" "}
                            <span className="font-semibold text-foreground">
                                {filteredUsers.length}
                            </span>{" "}
                            de{" "}
                            <span className="font-semibold text-foreground">
                                {users.length}
                            </span>{" "}
                            usuarios
                        </p>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            {hasActiveFilters ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    Limpiar filtros
                                </Button>
                            ) : null}

                            <Link
                                href="/superuser/users/new"
                                className={buttonVariants({
                                    variant: "primary",
                                    size: "sm",
                                })}
                            >
                                <UserPlus className="size-4" />
                                Crear usuario
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredUsers.length > 0 ? (
                <>
                    <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)] lg:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-left">
                                <thead className="border-b border-border bg-surface-muted">
                                    <tr className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                        <th className="px-6 py-4">
                                            Usuario
                                        </th>

                                        <th className="px-6 py-4">
                                            Rol
                                        </th>

                                        <th className="px-6 py-4">
                                            Estado
                                        </th>

                                        <th className="px-6 py-4">
                                            Fecha de creación
                                        </th>

                                        <th className="px-6 py-4 text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {filteredUsers.map(
                                        (user) => {
                                            const isCurrentUser =
                                                user.id ===
                                                currentUserId;

                                            return (
                                                <tr
                                                    key={
                                                        user.id
                                                    }
                                                    className="transition hover:bg-surface-muted/60"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                                                <UsersRound
                                                                    className="size-5"
                                                                    strokeWidth={
                                                                        1.9
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="max-w-64 truncate text-sm font-semibold text-foreground">
                                                                        {
                                                                            user.name
                                                                        }
                                                                    </p>

                                                                    {isCurrentUser ? (
                                                                        <Badge variant="primary">
                                                                            Tú
                                                                        </Badge>
                                                                    ) : null}
                                                                </div>

                                                                <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground-muted">
                                                                    <Mail className="size-3.5 shrink-0" />

                                                                    <span className="max-w-72 truncate">
                                                                        {
                                                                            user.email
                                                                        }
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <Badge variant="neutral">
                                                            {
                                                                ROLE_LABELS[
                                                                user.role
                                                                ]
                                                            }
                                                        </Badge>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant={
                                                                user.isActive
                                                                    ? "success"
                                                                    : "danger"
                                                            }
                                                        >
                                                            {user.isActive ? (
                                                                <CheckCircle2 className="size-3.5" />
                                                            ) : (
                                                                <ShieldOff className="size-3.5" />
                                                            )}

                                                            {user.isActive
                                                                ? "Activo"
                                                                : "Inactivo"}
                                                        </Badge>
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-foreground-muted">
                                                        {formatDate(
                                                            user.createdAt
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                href={`/superuser/users/edit?userId=${encodeURIComponent(
                                                                    user.id
                                                                )}`}
                                                                className={buttonVariants(
                                                                    {
                                                                        variant:
                                                                            "outline",
                                                                        size: "sm",
                                                                    }
                                                                )}
                                                            >
                                                                <Edit3 className="size-4" />
                                                                Editar
                                                            </Link>

                                                            <Button
                                                                type="button"
                                                                variant={
                                                                    user.isActive
                                                                        ? "ghost"
                                                                        : "secondary"
                                                                }
                                                                size="sm"
                                                                disabled={
                                                                    isCurrentUser &&
                                                                    user.isActive
                                                                }
                                                                className={
                                                                    user.isActive
                                                                        ? "text-danger hover:bg-danger-soft hover:text-danger"
                                                                        : undefined
                                                                }
                                                                onClick={() =>
                                                                    setSelectedStatusChange(
                                                                        {
                                                                            user,
                                                                            nextStatus:
                                                                                !user.isActive,
                                                                        }
                                                                    )
                                                                }
                                                            >
                                                                {user.isActive ? (
                                                                    <ShieldOff className="size-4" />
                                                                ) : (
                                                                    <UserCheck className="size-4" />
                                                                )}

                                                                {user.isActive
                                                                    ? "Desactivar"
                                                                    : "Activar"}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:hidden">
                        {filteredUsers.map((user) => {
                            const isCurrentUser =
                                user.id ===
                                currentUserId;

                            return (
                                <Card key={user.id}>
                                    <CardContent>
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                                <UsersRound
                                                    className="size-5"
                                                    strokeWidth={
                                                        1.9
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {
                                                            user.name
                                                        }
                                                    </p>

                                                    {isCurrentUser ? (
                                                        <Badge variant="primary">
                                                            Tú
                                                        </Badge>
                                                    ) : null}
                                                </div>

                                                <p className="mt-1 truncate text-xs text-foreground-muted">
                                                    {
                                                        user.email
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Badge variant="neutral">
                                                {
                                                    ROLE_LABELS[
                                                    user.role
                                                    ]
                                                }
                                            </Badge>

                                            <Badge
                                                variant={
                                                    user.isActive
                                                        ? "success"
                                                        : "danger"
                                                }
                                            >
                                                {user.isActive
                                                    ? "Activo"
                                                    : "Inactivo"}
                                            </Badge>
                                        </div>

                                        <div className="mt-4 rounded-xl bg-surface-muted px-3 py-2">
                                            <p className="text-xs text-foreground-muted">
                                                Creado el{" "}
                                                {formatDate(
                                                    user.createdAt
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                            <Link
                                                href={`/superuser/users/edit?userId=${encodeURIComponent(
                                                    user.id
                                                )}`}
                                                className={buttonVariants(
                                                    {
                                                        variant:
                                                            "outline",
                                                        size: "sm",
                                                    }
                                                )}
                                            >
                                                <Edit3 className="size-4" />
                                                Editar
                                            </Link>

                                            <Button
                                                type="button"
                                                variant={
                                                    user.isActive
                                                        ? "ghost"
                                                        : "secondary"
                                                }
                                                size="sm"
                                                disabled={
                                                    isCurrentUser &&
                                                    user.isActive
                                                }
                                                className={
                                                    user.isActive
                                                        ? "text-danger hover:bg-danger-soft hover:text-danger"
                                                        : undefined
                                                }
                                                onClick={() =>
                                                    setSelectedStatusChange(
                                                        {
                                                            user,
                                                            nextStatus:
                                                                !user.isActive,
                                                        }
                                                    )
                                                }
                                            >
                                                {user.isActive
                                                    ? "Desactivar"
                                                    : "Activar"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            ) : (
                <Card>
                    <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                            <Search
                                className="size-6"
                                strokeWidth={1.9}
                            />
                        </div>

                        <h3 className="mt-5 text-lg font-semibold text-foreground">
                            No encontramos usuarios
                        </h3>

                        <p className="mt-2 max-w-md text-sm leading-6 text-foreground-muted">
                            Ajusta los filtros o limpia la búsqueda para volver a mostrar las cuentas registradas.
                        </p>

                        {hasActiveFilters ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-5"
                                onClick={clearFilters}
                            >
                                Limpiar filtros
                            </Button>
                        ) : null}
                    </CardContent>
                </Card>
            )}

            <form
                ref={formRef}
                action={statusFormAction}
                className="hidden"
                onSubmit={() =>
                    setSelectedStatusChange(null)
                }
            >
                <input
                    type="hidden"
                    name="userId"
                    value={
                        selectedStatusChange?.user.id ??
                        ""
                    }
                />

                <input
                    type="hidden"
                    name="isActive"
                    value={String(
                        selectedStatusChange
                            ?.nextStatus ?? false
                    )}
                />
            </form>

            <ConfirmDialog
                open={Boolean(
                    selectedStatusChange
                )}
                title={
                    selectedStatusChange
                        ?.nextStatus
                        ? "Activar usuario"
                        : "Desactivar usuario"
                }
                description={
                    selectedStatusChange
                        ?.nextStatus
                        ? "La cuenta recuperará el acceso a ClinicFlow según los permisos de su rol."
                        : "La cuenta perderá el acceso al sistema, pero su información e historial permanecerán guardados."
                }
                confirmLabel={
                    selectedStatusChange
                        ?.nextStatus
                        ? "Activar usuario"
                        : "Desactivar usuario"
                }
                variant={
                    selectedStatusChange
                        ?.nextStatus
                        ? "primary"
                        : "danger"
                }
                pending={statusPending}
                onClose={() =>
                    setSelectedStatusChange(null)
                }
                onConfirm={confirmStatusChange}
            >
                {selectedStatusChange ? (
                    <div className="rounded-2xl border border-border bg-surface-muted p-4">
                        <p className="text-sm font-semibold text-foreground">
                            {
                                selectedStatusChange
                                    .user.name
                            }
                        </p>

                        <p className="mt-1 text-xs text-foreground-muted">
                            {
                                selectedStatusChange
                                    .user.email
                            }
                        </p>
                    </div>
                ) : null}
            </ConfirmDialog>
        </div>
    );
}