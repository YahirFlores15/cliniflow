"use client";

import {
    CalendarCheck2,
    CalendarX2,
    Clock3,
    Save,
} from "lucide-react";
import {
    useActionState,
} from "react";

import { ActionMessage } from "@/components/feedback/action-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    saveDoctorScheduleAction,
    type DoctorScheduleActionState,
} from "@/server/modules/doctor/doctor-schedule.actions";
import type {
    DoctorScheduleDTO,
} from "@/shared/dtos/doctor.dtos";
import { cn } from "@/lib/utils";

type DoctorScheduleFormProps = {
    schedules:
    DoctorScheduleDTO[];
};

type WeekdayDefinition = {
    value: number;
    label: string;
    shortLabel: string;
};

const WEEKDAYS:
    WeekdayDefinition[] = [
        {
            value: 1,
            label: "Lunes",
            shortLabel: "Lun",
        },
        {
            value: 2,
            label: "Martes",
            shortLabel: "Mar",
        },
        {
            value: 3,
            label: "Miércoles",
            shortLabel: "Mié",
        },
        {
            value: 4,
            label: "Jueves",
            shortLabel: "Jue",
        },
        {
            value: 5,
            label: "Viernes",
            shortLabel: "Vie",
        },
        {
            value: 6,
            label: "Sábado",
            shortLabel: "Sáb",
        },
        {
            value: 7,
            label: "Domingo",
            shortLabel: "Dom",
        },
    ];

const INITIAL_ACTION_STATE:
    DoctorScheduleActionState = {
    ok: false,
    message: "",
};

function ScheduleDayForm({
    weekday,
    schedule,
}: {
    weekday:
    WeekdayDefinition;
    schedule:
    DoctorScheduleDTO | null;
}) {
    const [
        state,
        formAction,
        pending,
    ] = useActionState(
        saveDoctorScheduleAction,
        INITIAL_ACTION_STATE
    );

    const isActive =
        schedule?.isActive ??
        false;

    return (
        <Card
            className={cn(
                "overflow-hidden transition",
                isActive
                    ? "border-primary-border"
                    : "border-border"
            )}
        >
            <CardHeader className="border-b border-border bg-surface-muted">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div
                            className={cn(
                                "flex size-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold",
                                isActive
                                    ? "border-primary-border bg-primary-soft text-primary"
                                    : "border-border bg-surface text-foreground-muted"
                            )}
                        >
                            {
                                weekday.shortLabel
                            }
                        </div>

                        <div>
                            <CardTitle>
                                {
                                    weekday.label
                                }
                            </CardTitle>

                            <CardDescription>
                                Configura la jornada y duración de las consultas.
                            </CardDescription>
                        </div>
                    </div>

                    <Badge
                        variant={
                            isActive
                                ? "success"
                                : "neutral"
                        }
                    >
                        {isActive
                            ? "Activo"
                            : "Inactivo"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <form
                    action={
                        formAction
                    }
                    className="space-y-5"
                >
                    <input
                        type="hidden"
                        name="weekday"
                        value={
                            weekday.value
                        }
                    />

                    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-surface-muted px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Día disponible
                            </p>

                            <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                Permite que recepción programe citas durante esta jornada.
                            </p>
                        </div>

                        <input
                            type="checkbox"
                            name="isActive"
                            defaultChecked={
                                isActive
                            }
                            className="size-5 shrink-0 rounded border-border text-primary accent-[var(--color-primary)]"
                        />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor={`schedule-start-${weekday.value}`}
                                className="mb-2 block text-sm font-semibold text-foreground"
                            >
                                Hora inicial
                            </label>

                            <Input
                                id={`schedule-start-${weekday.value}`}
                                type="time"
                                name="startTime"
                                required
                                defaultValue={
                                    schedule
                                        ?.startTime ??
                                    "08:00"
                                }
                            />
                        </div>

                        <div>
                            <label
                                htmlFor={`schedule-end-${weekday.value}`}
                                className="mb-2 block text-sm font-semibold text-foreground"
                            >
                                Hora final
                            </label>

                            <Input
                                id={`schedule-end-${weekday.value}`}
                                type="time"
                                name="endTime"
                                required
                                defaultValue={
                                    schedule
                                        ?.endTime ??
                                    "16:00"
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor={`schedule-duration-${weekday.value}`}
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Duración de cada cita
                        </label>

                        <Select
                            id={`schedule-duration-${weekday.value}`}
                            name="appointmentDurationMinutes"
                            defaultValue={
                                schedule
                                    ?.appointmentDurationMinutes ??
                                30
                            }
                        >
                            <option value="30">
                                30 minutos
                            </option>

                            <option value="60">
                                60 minutos
                            </option>
                        </Select>

                        <p className="mt-2 text-xs leading-5 text-foreground-muted">
                            La jornada debe poder dividirse exactamente en bloques de esta duración.
                        </p>
                    </div>

                    {state.message ? (
                        <ActionMessage
                            variant={
                                state.ok
                                    ? "success"
                                    : "error"
                            }
                        >
                            {
                                state.message
                            }
                        </ActionMessage>
                    ) : null}

                    <div className="flex justify-end border-t border-border pt-5">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={
                                pending
                            }
                        >
                            <Save className="size-4" />

                            {pending
                                ? "Guardando..."
                                : "Guardar horario"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export function DoctorScheduleForm({
    schedules,
}: DoctorScheduleFormProps) {
    const activeSchedules =
        schedules.filter(
            (schedule) =>
                schedule.isActive
        );

    const inactiveSchedules =
        WEEKDAYS.length -
        activeSchedules.length;

    return (
        <div className="flex flex-col gap-6">
            <section className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardContent className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">
                                Días activos
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                {
                                    activeSchedules.length
                                }
                            </p>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                Jornadas disponibles para programar consultas.
                            </p>
                        </div>

                        <div className="flex size-11 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                            <CalendarCheck2 className="size-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">
                                Días inactivos
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                {
                                    inactiveSchedules
                                }
                            </p>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                Días cerrados para nuevas citas.
                            </p>
                        </div>

                        <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-muted text-foreground-muted">
                            <CalendarX2 className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="rounded-2xl border border-warning-border bg-warning-soft p-5">
                <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 size-5 shrink-0 text-warning-hover" />

                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Protección de citas existentes
                        </p>

                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            No podrás desactivar un día ni reducir una jornada cuando el cambio deje citas futuras programadas fuera del nuevo horario.
                        </p>
                    </div>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
                {WEEKDAYS.map(
                    (weekday) => {
                        const schedule =
                            schedules.find(
                                (
                                    currentSchedule
                                ) =>
                                    currentSchedule.weekday ===
                                    weekday.value
                            ) ?? null;

                        return (
                            <ScheduleDayForm
                                key={
                                    weekday.value
                                }
                                weekday={
                                    weekday
                                }
                                schedule={
                                    schedule
                                }
                            />
                        );
                    }
                )}
            </section>
        </div>
    );
}