import { CalendarClock, FileHeart, Mail, NotebookPen, Phone, Search, UserRound, } from "lucide-react";
import type { DoctorRelatedPatientDTO, } from "@/shared/dtos/doctor-patient.dtos";
import { Card, CardContent, } from "@/components/ui/card";
import { buttonVariants, } from "@/components/ui/button";
import { Input, } from "@/components/ui/input";
import { Badge, } from "@/components/ui/badge";
import { cn, } from "@/lib/utils";
import Link from "next/link";


type PatientsListProps = {
    patients:
    DoctorRelatedPatientDTO[];

    searchQuery: string;
};

function formatDateTime(
    value: string | null
): string {
    if (!value) {
        return "Sin registrar";
    }

    const parsedDate =
        new Date(value);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(parsedDate);
}

export function PatientsList({
    patients,
    searchQuery,
}: PatientsListProps) {
    return (
        <div className="flex flex-col gap-5">
            <Card>
                <CardContent>
                    <form
                        method="get"
                        className="flex flex-col gap-3 sm:flex-row sm:items-end"
                    >
                        <div className="flex-1">
                            <label
                                htmlFor="doctor-patient-search"
                                className="mb-2 block text-sm font-semibold text-foreground"
                            >
                                Buscar paciente
                            </label>

                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />

                                <Input
                                    id="doctor-patient-search"
                                    name="query"
                                    type="search"
                                    defaultValue={
                                        searchQuery
                                    }
                                    placeholder="Nombre, email o teléfono"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={buttonVariants({
                                variant:
                                    "primary",
                                size: "lg",
                            })}
                        >
                            Buscar
                        </button>

                        {searchQuery ? (
                            <Link
                                href="/doctor/patients"
                                className={buttonVariants({
                                    variant:
                                        "outline",
                                    size: "lg",
                                })}
                            >
                                Limpiar
                            </Link>
                        ) : null}
                    </form>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Pacientes encontrados
                    </h3>

                    <p className="mt-1 text-sm text-foreground-muted">
                        Solo aparecen pacientes relacionados con tu perfil mediante una cita.
                    </p>
                </div>

                <Badge variant="primary">
                    {patients.length}
                </Badge>
            </div>

            {patients.length === 0 ? (
                <Card>
                    <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
                        <UserRound className="size-10 text-primary" />

                        <h3 className="mt-4 text-lg font-semibold text-foreground">
                            No se encontraron pacientes
                        </h3>

                        <p className="mt-2 max-w-md text-sm leading-6 text-foreground-muted">
                            No existen pacientes relacionados que coincidan con la búsqueda actual.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                    {patients.map(
                        (patient) => (
                            <Card
                                key={
                                    patient.patientId
                                }
                            >
                                <CardContent className="flex h-full flex-col gap-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                                <UserRound className="size-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-bold text-foreground">
                                                    {
                                                        patient.name
                                                    }
                                                </h3>

                                                <p className="mt-1 flex items-center gap-2 text-xs text-foreground-muted">
                                                    <Mail className="size-3.5 shrink-0" />

                                                    <span className="truncate">
                                                        {
                                                            patient.email
                                                        }
                                                    </span>
                                                </p>

                                                {patient.phone ? (
                                                    <p className="mt-1 flex items-center gap-2 text-xs text-foreground-muted">
                                                        <Phone className="size-3.5 shrink-0" />

                                                        {
                                                            patient.phone
                                                        }
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        <Badge
                                            variant={
                                                patient.hasMedicalRecord
                                                    ? "success"
                                                    : "neutral"
                                            }
                                        >
                                            {patient.hasMedicalRecord
                                                ? "Con expediente"
                                                : "Sin expediente"}
                                        </Badge>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl border border-border bg-surface-muted p-4">
                                            <CalendarClock className="size-4 text-primary" />

                                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-foreground-muted">
                                                Próxima cita
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-foreground">
                                                {patient.nextAppointmentDateTime
                                                    ? formatDateTime(
                                                        patient.nextAppointmentDateTime
                                                    )
                                                    : "Sin cita próxima"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-border bg-surface-muted p-4">
                                            <CalendarClock className="size-4 text-secondary" />

                                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-foreground-muted">
                                                Última cita
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-foreground">
                                                {patient.lastAppointmentDateTime
                                                    ? formatDateTime(
                                                        patient.lastAppointmentDateTime
                                                    )
                                                    : "Sin cita anterior"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="neutral">
                                            {
                                                patient.appointmentCount
                                            }{" "}
                                            {patient.appointmentCount === 1
                                                ? "cita"
                                                : "citas"}
                                        </Badge>

                                        <Badge variant="primary">
                                            <NotebookPen className="size-3.5" />

                                            {
                                                patient.medicalNoteCount
                                            }{" "}
                                            {patient.medicalNoteCount === 1
                                                ? "nota"
                                                : "notas"}
                                        </Badge>
                                    </div>

                                    <div className="mt-auto border-t border-border pt-4">
                                        <Link
                                            href={`/doctor/patients/record?patientId=${encodeURIComponent(
                                                patient.patientId
                                            )}`}
                                            className={cn(
                                                buttonVariants({
                                                    variant:
                                                        "outline",
                                                    size: "lg",
                                                }),
                                                "w-full"
                                            )}
                                        >
                                            <FileHeart className="size-4.5" />

                                            Abrir expediente
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    )}
                </div>
            )}
        </div>
    );
}