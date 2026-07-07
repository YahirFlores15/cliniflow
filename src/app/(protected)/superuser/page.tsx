import { listAdminUsers } from "@/server/modules/superuser/superuser.repository";
import { SuperuserPanel } from "@/app/(protected)/superuser/superuser-panel";
import { requireRole } from "@/server/auth/session";


export default async function SuperuserPage() {
    const session = await requireRole(["SUPERUSER"]);
    const users = listAdminUsers();

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
            <div className="mx-auto flex max-w-6xl flex-col gap-8">
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
                            ClinicFlow
                        </p>
                        <h1 className="text-3xl font-bold">
                            Panel de superusuario
                        </h1>
                        <p className="max-w-3xl text-sm text-slate-400">
                            Administración general de usuarios. Desde aquí se crean cuentas,
                            se editan datos administrativos básicos y se activa o desactiva el acceso.
                            Sin notas médicas, sin expediente clínico, sin meterse donde no toca.
                        </p>
                    </div>
                </section>

                <SuperuserPanel
                    users={users}
                    currentUserId={session.user.id}
                />
            </div>
        </main>
    );
}