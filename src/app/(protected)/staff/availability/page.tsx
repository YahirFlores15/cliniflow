import { getStaffCalendarAvailability } from "@/server/modules/staff/staff-calendar.service";
import { AvailabilityBoard } from "@/app/(protected)/staff/availability/availability-board";
import { CalendarDays, CalendarPlus, } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import Link from "next/link";


export default async function StaffAvailabilityPage() {
    await requireRole([
        ROLES.STAFF,
    ]);

    const availability =
        getStaffCalendarAvailability();

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-secondary-border bg-secondary-soft text-secondary">
                        <CalendarDays
                            className="size-6"
                            strokeWidth={1.9}
                        />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Recepción
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Disponibilidad médica
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Consulta horarios semanales, duración de citas y bloqueos registrados por cada médico.
                    </p>
                </div>

                <Link
                    href="/staff/appointments/new"
                    className={buttonVariants({
                        variant: "primary",
                        size: "lg",
                    })}
                >
                    <CalendarPlus className="size-4.5" />
                    Nueva cita
                </Link>
            </section>

            <AvailabilityBoard
                doctors={
                    availability.doctors
                }
                schedules={
                    availability.schedules
                }
                blocks={
                    availability.blocks
                }
            />
        </div>
    );
}