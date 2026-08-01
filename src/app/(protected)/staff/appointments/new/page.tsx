import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { getStaffDoctors, getStaffPatients, } from "@/server/modules/staff/staff.service";
import { AppointmentForm } from "@/app/(protected)/staff/appointments/new/appointment-form";
import { ArrowLeft, CalendarPlus, Info, ShieldCheck, } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import { cn } from "@/lib/utils";
import Link from "next/link";


type NewStaffAppointmentPageProps = {
    searchParams: Promise<{
        doctorId?: string;
        date?: string;
        time?: string;
    }>;
};

function isValidDateValue(
    value: string
): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(
        value
    );
}

function isValidTimeValue(
    value: string
): boolean {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(
        value
    );
}

export default async function NewStaffAppointmentPage({
    searchParams,
}: NewStaffAppointmentPageProps) {
    await requireRole([ROLES.STAFF]);

    const patients =
        getStaffPatients();

    const doctors =
        getStaffDoctors();

    const resolvedSearchParams =
        await searchParams;

    const requestedDoctorId =
        resolvedSearchParams.doctorId?.trim() ??
        "";

    const initialDoctorId =
        doctors.some(
            (doctor) =>
                doctor.id ===
                requestedDoctorId
        )
            ? requestedDoctorId
            : doctors[0]?.id ?? "";

    const requestedDate =
        resolvedSearchParams.date?.trim() ??
        "";

    const initialDate =
        isValidDateValue(requestedDate)
            ? requestedDate
            : "";

    const requestedTime =
        resolvedSearchParams.time?.trim() ??
        "";

    const initialTime =
        isValidTimeValue(requestedTime)
            ? requestedTime
            : "";

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <Link
                        href="/staff/appointments"
                        className={cn(
                            buttonVariants({
                                variant: "ghost",
                                size: "sm",
                            }),
                            "-ml-3 mb-3"
                        )}
                    >
                        <ArrowLeft className="size-4" />
                        Volver al calendario
                    </Link>

                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Recepción
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Nueva cita
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Selecciona paciente, médico y horario. ClinicFlow comprobará todas las reglas de disponibilidad antes de guardar.
                    </p>
                </div>

                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                    <CalendarPlus
                        className="size-6"
                        strokeWidth={1.9}
                    />
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Información de la cita
                        </CardTitle>

                        <CardDescription>
                            Completa los datos administrativos necesarios para reservar el horario.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <AppointmentForm
                            patients={patients}
                            doctors={doctors}
                            initialDoctorId={
                                initialDoctorId
                            }
                            initialDate={
                                initialDate
                            }
                            initialTime={
                                initialTime
                            }
                        />
                    </CardContent>
                </Card>

                <aside className="space-y-4">
                    <Card>
                        <CardContent>
                            <div className="flex size-10 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                                <ShieldCheck
                                    className="size-5"
                                    strokeWidth={1.9}
                                />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-foreground">
                                Validación completa
                            </h3>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                Antes de guardar se validan horario laboral, duración, bloqueos, traslapes y anticipación mínima.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex size-10 items-center justify-center rounded-xl border border-warning-border bg-warning-soft text-warning-hover">
                                <Info
                                    className="size-5"
                                    strokeWidth={1.9}
                                />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-foreground">
                                Datos administrativos
                            </h3>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                El motivo de consulta registrado por recepción no sustituye una nota médica ni contiene diagnóstico.
                            </p>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}