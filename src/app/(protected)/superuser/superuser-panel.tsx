"use client";

import type { AdminUserDTO } from "@/shared/dtos/auth.dtos";
import type { SuperuserActionState } from "@/server/modules/superuser/superuser.actions";
import {
    createUserAction,
    updateUserAction,
    updateUserStatusAction,
} from "@/server/modules/superuser/superuser.actions";
import { ROLE_LABELS, ROLE_VALUES } from "@/shared/constants/roles";
import { UserPlus } from "lucide-react";
import { useActionState, useState } from "react";

type SuperuserPanelProps = {
    users: AdminUserDTO[];
    currentUserId: string;
};

const initialSuperuserActionState: SuperuserActionState = {
    ok: false,
    message: "",
};

function formatStatus(isActive: boolean): string {
    return isActive ? "Activo" : "Inactivo";
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function SuperuserPanel(props: SuperuserPanelProps) {
    const [createState, createFormAction, createPending] = useActionState(
        createUserAction,
        initialSuperuserActionState
    );

    const [updateState, updateFormAction, updatePending] = useActionState(
        updateUserAction,
        initialSuperuserActionState
    );

    const [statusState, statusFormAction, statusPending] = useActionState(
        updateUserStatusAction,
        initialSuperuserActionState
    );

    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const editingUser = props.users.find((user) => user.id === editingUserId);

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
                            <UserPlus size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Crear usuario</h2>
                            <p className="text-sm text-slate-400">
                                Crea usuarios con rol inicial.
                            </p>
                        </div>
                    </div>

                    {createState.message && (
                        <div
                            className={
                                createState.ok
                                    ? "mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                                    : "mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                            }
                        >
                            {createState.message}
                        </div>
                    )}

                    <form action={createFormAction} className="flex flex-col gap-4">
                        <label className="flex flex-col gap-2 text-sm">
                            <span className="font-medium text-slate-300">Nombre</span>
                            <input
                                name="name"
                                type="text"
                                required
                                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                placeholder="Nombre completo"
                            />
                        </label>

                        <label className="flex flex-col gap-2 text-sm">
                            <span className="font-medium text-slate-300">Email</span>
                            <input
                                name="email"
                                type="email"
                                required
                                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                placeholder="usuario@clinica.com"
                            />
                        </label>

                        <label className="flex flex-col gap-2 text-sm">
                            <span className="font-medium text-slate-300">
                                Contraseña temporal
                            </span>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </label>

                        <label className="flex flex-col gap-2 text-sm">
                            <span className="font-medium text-slate-300">Rol</span>
                            <select
                                name="role"
                                required
                                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                defaultValue="STAFF"
                            >
                                {ROLE_VALUES.map((role) => (
                                    <option key={role} value={role}>
                                        {ROLE_LABELS[role]}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            type="submit"
                            disabled={createPending}
                            className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {createPending ? "Creando..." : "Crear usuario"}
                        </button>
                    </form>
                </div>

                {editingUser && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="text-xl font-semibold">Editar usuario</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Edición básica: nombre y email. El rol no se cambia aquí para no romper perfiles ligados.
                        </p>

                        {updateState.message && (
                            <div
                                className={
                                    updateState.ok
                                        ? "mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                                        : "mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                                }
                            >
                                {updateState.message}
                            </div>
                        )}

                        <form action={updateFormAction} className="mt-5 flex flex-col gap-4">
                            <input type="hidden" name="userId" value={editingUser.id} />

                            <label className="flex flex-col gap-2 text-sm">
                                <span className="font-medium text-slate-300">Nombre</span>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    defaultValue={editingUser.name}
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm">
                                <span className="font-medium text-slate-300">Email</span>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    defaultValue={editingUser.email}
                                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                />
                            </label>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={updatePending}
                                    className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {updatePending ? "Guardando..." : "Guardar cambios"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEditingUserId(null)}
                                    className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {statusState.message && (
                    <div
                        className={
                            statusState.ok
                                ? "rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                                : "rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                        }
                    >
                        {statusState.message}
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="border-b border-slate-800 p-6">
                    <h2 className="text-xl font-semibold">Usuarios registrados</h2>
                    <p className="text-sm text-slate-400">Total: {props.users.length}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Creado</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {props.users.map((user) => {
                                const isCurrentUser = user.id === props.currentUserId;

                                return (
                                    <tr key={user.id} className="text-slate-300">
                                        <td className="px-6 py-4 font-medium text-slate-100">
                                            {user.name}
                                            {isCurrentUser && (
                                                <span className="ml-2 rounded-full bg-cyan-400/10 px-2 py-1 text-xs text-cyan-300">
                                                    Tú
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">{ROLE_LABELS[user.role]}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={
                                                    user.isActive
                                                        ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                                                        : "rounded-full bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-300"
                                                }
                                            >
                                                {formatStatus(user.isActive)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingUserId(user.id)}
                                                    className="rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
                                                >
                                                    Editar
                                                </button>

                                                <form action={statusFormAction}>
                                                    <input type="hidden" name="userId" value={user.id} />
                                                    <input
                                                        type="hidden"
                                                        name="isActive"
                                                        value={String(!user.isActive)}
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={statusPending || (isCurrentUser && user.isActive)}
                                                        className={
                                                            user.isActive
                                                                ? "rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                                                                : "rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                                                        }
                                                    >
                                                        {user.isActive ? "Desactivar" : "Activar"}
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {props.users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                                        No hay usuarios registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}