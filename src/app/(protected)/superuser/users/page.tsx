import { listAdminUsers } from "@/server/modules/superuser/superuser.repository";
import { SuperuserPanel } from "@/app/(protected)/superuser/superuser-panel";
import { requireRole } from "@/server/auth/session";


export default async function SuperuserUsersPage() {
    const session = await requireRole(["SUPERUSER"]);
    const users = listAdminUsers();

    return (
        <div className="flex flex-col gap-6">
            <section>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    Gestión de acceso
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Usuarios
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                    Crea cuentas, actualiza datos administrativos y
                    controla qué usuarios pueden acceder a ClinicFlow.
                </p>
            </section>

            <SuperuserPanel
                users={users}
                currentUserId={session.user.id}
            />
        </div>
    );
}