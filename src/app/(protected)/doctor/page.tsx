import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";


export default async function DoctorPage() {
    const session = await requireRole([ROLES.DOCTOR]);

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
                Panel médico
            </p>

            <h1 className="mt-3 text-3xl font-bold">
                Bienvenido, Dr. {session.user.name}
            </h1>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="font-semibold">Agenda propia</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Consulta de citas asignadas al doctor autenticado.
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="font-semibold">Expediente clínico</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Consulta de expediente y creación de notas médicas.
                    </p>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="font-semibold">Horarios</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Configuración de horarios laborales y bloqueos.
                    </p>
                </article>
            </div>
        </div>
    );
}