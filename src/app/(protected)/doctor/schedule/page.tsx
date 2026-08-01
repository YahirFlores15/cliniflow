import { getDoctorScheduleWorkspace, } from "@/server/modules/doctor/doctor-schedule.service";
import { DoctorScheduleForm, } from "@/app/(protected)/doctor/schedule/doctor-schedule-form";
import { CalendarRange, Clock3, Info, } from "lucide-react";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole, } from "@/server/auth/session";
import { ROLES, } from "@/shared/constants/roles";
import { cn, } from "@/lib/utils";
import Link from "next/link";


export default async function DoctorSchedulePage() {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const workspace =
        getDoctorScheduleWorkspace(
            session.user.id
        );

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                        <Clock3
                            className="size-6"
                            strokeWidth={
                                1.9
                            }
                        />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Área médica
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Horario semanal
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Configura los días, horas y duración de las consultas disponibles para tu agenda.
                    </p>
                </div>

                <Link
                    href="/doctor/agenda"
                    className={cn(
                        buttonVariants({
                            variant:
                                "outline",
                            size:
                                "lg",
                        }),
                        "w-full sm:w-auto"
                    )}
                >
                    <CalendarRange className="size-4.5" />
                    Consultar agenda
                </Link>
            </section>

            <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                <div className="flex items-start gap-3">
                    <Info className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Reglas de disponibilidad
                        </p>

                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            Los horarios activos son utilizados por recepción para calcular franjas disponibles. Cada jornada debe contener al menos una cita completa y dividirse exactamente en bloques de 30 o 60 minutos.
                        </p>
                    </div>
                </div>
            </section>

            <DoctorScheduleForm
                schedules={
                    workspace.schedules
                }
            />
        </div>
    );
}