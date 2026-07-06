import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";


export default async function PatientPage() {
    const session = await requireRole([ROLES.PATIENT]);

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
                Portal del paciente
            </p>

            <h1 className="mt-3 text-3xl font-bold">
                Bienvenido, {session.user.name}
            </h1>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="font-semibold">Próximas citas</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Consulta de citas programadas.
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="font-semibold">Historial médico</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Vista de notas, recetas e indicaciones propias.
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="font-semibold">Perfil</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Información personal del paciente autenticado.
                    </p>
                </article>
            </div>
        </div>
    );
}