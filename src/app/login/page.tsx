import { getCurrentSession, getHomePathForRole } from "@/server/auth/session";
import { redirect } from "next/navigation";

import { LoginForm } from "./login-form";


export default async function LoginPage() {
    const session = await getCurrentSession();

    if (session) {
        redirect(getHomePathForRole(session.user.role));
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
                <div className="grid w-full gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
                    <div>
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                            ClinicFlow
                        </p>

                        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white md:text-6xl">
                            Administración clínica simple, segura y presentable.
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">
                            Sistema web para gestionar pacientes, médicos, staff, citas y
                            expediente clínico básico en una sola clínica privada.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-white p-8 text-slate-950 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold">Iniciar sesión</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Accede con tu correo y contraseña.
                            </p>
                        </div>

                        <LoginForm />
                    </div>
                </div>
            </section>
        </main>
    );
}