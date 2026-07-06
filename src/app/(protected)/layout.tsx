import { logoutAction } from "@/server/auth/auth.actions";
import { ROLE_LABELS } from "@/shared/constants/roles";
import { requireSession } from "@/server/auth/session";
import type { ReactNode } from "react";


type ProtectedLayoutProps = {
    children: ReactNode;
};

export default async function ProtectedLayout({
    children,
}: ProtectedLayoutProps) {
    const session = await requireSession();

    return (
        <main className="min-h-screen bg-slate-100 text-slate-950">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-lg font-bold">ClinicFlow</p>
                        <p className="text-sm text-slate-500">
                            {session.user.name} · {ROLE_LABELS[session.user.role]}
                        </p>
                    </div>

                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100"
                        >
                            Cerrar sesión
                        </button>
                    </form>
                </div>
            </header>

            <section className="mx-auto max-w-6xl px-6 py-8">{children}</section>
        </main>
    );
}