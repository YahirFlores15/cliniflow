import { getRelatedPatientsForDoctor, } from "@/server/modules/doctor/doctor-patient.service";
import { DoctorPatientSearchSchema, } from "@/shared/schemas/doctor-patient.schemas";
import { PatientsList, } from "@/app/(protected)/doctor/patients/patients-list";
import { CalendarRange, FileHeart, UsersRound, } from "lucide-react";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole, } from "@/server/auth/session";
import { ROLES, } from "@/shared/constants/roles";
import { Badge, } from "@/components/ui/badge";
import Link from "next/link";


type DoctorPatientsPageProps = {
    searchParams: Promise<{
        query?: string;
    }>;
};

export default async function DoctorPatientsPage({
    searchParams,
}: DoctorPatientsPageProps) {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const resolvedSearchParams =
        await searchParams;

    const parsedSearch =
        DoctorPatientSearchSchema.safeParse({
            query:
                resolvedSearchParams.query,
        });

    const searchQuery =
        parsedSearch.success
            ? parsedSearch.data.query
            : "";

    const patients =
        getRelatedPatientsForDoctor({
            userId:
                session.user.id,

            searchQuery,
        });

    const patientsWithRecord =
        patients.filter(
            (patient) =>
                patient.hasMedicalRecord
        ).length;

    const patientsWithUpcomingAppointment =
        patients.filter(
            (patient) =>
                Boolean(
                    patient.nextAppointmentDateTime
                )
        ).length;

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                        <UsersRound
                            className="size-6"
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Área médica
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Pacientes relacionados
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta los pacientes que han tenido al menos una cita asociada con tu perfil médico.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="primary">
                            {
                                patients.length
                            }{" "}
                            pacientes
                        </Badge>

                        <Badge variant="success">
                            {
                                patientsWithRecord
                            }{" "}
                            con expediente
                        </Badge>

                        <Badge variant="warning">
                            {
                                patientsWithUpcomingAppointment
                            }{" "}
                            con cita próxima
                        </Badge>
                    </div>
                </div>

                <Link
                    href="/doctor/agenda"
                    className={buttonVariants({
                        variant:
                            "outline",
                        size: "lg",
                    })}
                >
                    <CalendarRange className="size-4.5" />

                    Volver a agenda
                </Link>
            </section>

            <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                <div className="flex items-start gap-3">
                    <FileHeart className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Acceso clínico limitado
                        </p>

                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            No puedes consultar pacientes ajenos. El acceso al expediente se valida nuevamente en el servidor al abrirlo y al guardar cambios.
                        </p>
                    </div>
                </div>
            </section>

            <PatientsList
                patients={
                    patients
                }
                searchQuery={
                    searchQuery
                }
            />
        </div>
    );
}