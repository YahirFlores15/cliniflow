"use client";

import {
    CalendarDays,
    Clock3,
    LoaderCircle,
    RotateCw,
} from "lucide-react";
import { useActionState } from "react";

import { ActionMessage } from "@/components/feedback/action-message";
import type { CalendarAppointment } from "@/components/calendar/calendar.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    rescheduleAppointmentAction,
    type StaffActionState,
} from "@/server/modules/staff/staff.actions";

type RescheduleAppointmentFormProps = {
    appointment: CalendarAppointment;
    onCancel: () => void;
};

const initialState: StaffActionState = {
    ok: false,
    message: "",
};

export function RescheduleAppointmentForm({
    appointment,
    onCancel,
}: RescheduleAppointmentFormProps) {
    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        rescheduleAppointmentAction,
        initialState
    );

    const hasError =
        Boolean(state.message) && !state.ok;

    return (
        <form
            action={formAction}
            className="space-y-5"
        >
            <input
                type="hidden"
                name="appointmentId"
                value={appointment.id}
            />

            {state.message ? (
                <ActionMessage
                    variant={
                        state.ok
                            ? "success"
                            : "error"
                    }
                >
                    {state.message}
                </ActionMessage>
            ) : null}

            <div className="rounded-2xl border border-primary-border bg-primary-soft p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    Cita seleccionada
                </p>

                <p className="mt-2 text-sm font-semibold text-foreground">
                    {appointment.patientName}
                </p>

                <p className="mt-1 text-xs text-foreground-muted">
                    {appointment.doctorName}
                </p>
            </div>

            <div>
                <label
                    htmlFor="reschedule-date"
                    className="mb-2 block text-sm font-semibold text-foreground"
                >
                    Nueva fecha
                </label>

                <Input
                    id="reschedule-date"
                    name="scheduledDate"
                    type="date"
                    required
                    defaultValue={
                        appointment.scheduledDate
                    }
                    disabled={isPending}
                    hasError={hasError}
                    leadingIcon={
                        <CalendarDays
                            className="size-4.5"
                            strokeWidth={1.9}
                        />
                    }
                />
            </div>

            <div>
                <label
                    htmlFor="reschedule-time"
                    className="mb-2 block text-sm font-semibold text-foreground"
                >
                    Nueva hora
                </label>

                <Input
                    id="reschedule-time"
                    name="startTime"
                    type="time"
                    required
                    step={1800}
                    defaultValue={
                        appointment.startTime
                    }
                    disabled={isPending}
                    hasError={hasError}
                    leadingIcon={
                        <Clock3
                            className="size-4.5"
                            strokeWidth={1.9}
                        />
                    }
                />

                <p className="mt-2 text-xs leading-5 text-foreground-muted">
                    Se volverán a validar horario laboral, bloqueos, traslapes y anticipación mínima de ocho horas.
                </p>
            </div>

            <div className="rounded-2xl border border-warning-border bg-warning-soft p-4">
                <p className="text-sm font-semibold text-foreground">
                    Duración conservada
                </p>

                <p className="mt-1 text-xs leading-5 text-foreground-muted">
                    La cita mantendrá su duración actual de{" "}
                    {appointment.durationMinutes} minutos.
                </p>
            </div>

            <div className="grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={onCancel}
                >
                    Volver al detalle
                </Button>

                <Button
                    type="submit"
                    disabled={
                        isPending ||
                        appointment.status !==
                        "SCHEDULED"
                    }
                >
                    {isPending ? (
                        <>
                            <LoaderCircle className="size-4 animate-spin" />
                            Reagendando...
                        </>
                    ) : (
                        <>
                            <RotateCw className="size-4" />
                            Confirmar cambio
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}