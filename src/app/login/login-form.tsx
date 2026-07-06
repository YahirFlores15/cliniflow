"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/server/auth/auth.actions";

const initialState: LoginActionState = {
    ok: false,
    message: "",
};

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(
        loginAction,
        initialState
    );

    return (
        <form action={formAction} className="space-y-5">
            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    Correo electrónico
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    placeholder="admin@cliniflow.local"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    Contraseña
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    placeholder="••••••••"
                />
            </div>

            {state.message ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {state.message}
                </p>
            ) : null}

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isPending ? "Entrando..." : "Entrar"}
            </button>
        </form>
    );
}