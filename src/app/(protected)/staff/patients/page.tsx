import { PatientsList } from "@/app/(protected)/staff/patients/patients-list";
import { getStaffPatients } from "@/server/modules/staff/staff.service";
import { UserPlus, UsersRound, } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import Link from "next/link";


type StaffPatientsPageProps = {
    searchParams: Promise<{
        created?: string;
        updated?: string;
    }>;
};

export default async function StaffPatientsPage({
    searchParams,
}: StaffPatientsPageProps) {
    await requireRole([ROLES.STAFF]);

    const patients = getStaffPatients();
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
                        Recepción
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Pacientes
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta los datos administrativos,
                        el estado de acceso y la información
                        de contacto de los pacientes.
                    </p>
                </div>

                <Link
                    href="/staff/patients/new"
                    className={buttonVariants({
                        variant: "primary",
                        size: "lg",
                    })}
                >
                    <UserPlus className="size-4.5" />
                    Registrar paciente
                </Link>
            </section>

            <PatientsList
                patients={patients}
                createdSuccessfully={
                    resolvedSearchParams.created ===
                    "1"
                }
                updatedSuccessfully={
                    resolvedSearchParams.updated ===
                    "1"
                }
            />
        </div>
    );
}