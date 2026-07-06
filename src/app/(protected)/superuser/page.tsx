import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";


export default async function SuperuserPage() {
    const session = await requireRole([ROLES.SUPERUSER]);

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
                Panel de superusuario
            </p>

            <h1 className="mt-3 text-3xl font-bold">
                Bienvenido, {session.user.name}
            </h1>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="font-semibold">Usuarios</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Gestión general de usuarios internos y pacientes.
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="font-semibold">Administración</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Activación, desactivación y control básico del sistema.
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="font-semibold">Restricción clínica</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Este rol no puede ver ni editar notas médicas.
                    </p>
                </article>
            </div>
        </div>
    );
}