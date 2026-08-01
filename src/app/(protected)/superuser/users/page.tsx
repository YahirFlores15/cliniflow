import { listAdminUsers } from "@/server/modules/superuser/superuser.repository";
import { UsersTable } from "@/app/(protected)/superuser/users/users-table";
import { UserPlus, UsersRound, } from "lucide-react";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import Link from "next/link";


type SuperuserUsersPageProps = {
    searchParams: Promise<{
        created?: string;
    }>;
};

export default async function SuperuserUsersPage({
    searchParams,
}: SuperuserUsersPageProps) {
    const session = await requireRole([
        "SUPERUSER",
    ]);

    const users = listAdminUsers();
    const resolvedSearchParams =
        await searchParams;

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                        <UsersRound
                            className="size-6"
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Gestión de acceso
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Usuarios
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta, filtra y administra las cuentas autorizadas para acceder a ClinicFlow.
                    </p>
                </div>

                <Link
                    href="/superuser/users/new"
                    className={buttonVariants({
                        variant: "primary",
                        size: "lg",
                    })}
                >
                    <UserPlus className="size-4.5" />
                    Crear usuario
                </Link>
            </section>

            <UsersTable
                users={users}
                currentUserId={session.user.id}
                createdSuccessfully={
                    resolvedSearchParams.created ===
                    "1"
                }
            />
        </div>
    );
}