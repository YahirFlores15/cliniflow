"use client";

import {
    CalendarX2,
    LoaderCircle,
    TriangleAlert,
} from "lucide-react";
import { useActionState } from "react";

import { ActionMessage } from "@/components/feedback/action-message";
import type { CalendarAppointment } from "@/components/calendar/calendar.types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    cancelAppointmentAction,
    type StaffActionState,
} from "@/server/modules/staff/staff.actions";

type CancelAppointmentFormProps = {
    appointment: CalendarAppointment;
    onCancel: () => void;
};

const initialState: StaffActionState = {
    ok: false,
    message: "",
};

export function CancelAppointmentForm({
    appointment,
    onCancel,
}: CancelAppointmentFormProps) {
    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        cancelAppointmentAction,
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

            <div className="rounded-2xl border border-danger-border bg-danger-soft p-5">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-danger-border bg-surface text-danger">
                        <TriangleAlert
                            className="size-5"
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-danger">
                            Esta acción no se revierte automáticamente
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-danger">
                            La cita quedará cancelada y no podrá reagendarse posteriormente. Será necesario crear una nueva cita.
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-muted p-4">
                <p className="text-sm font-semibold text-foreground">
                    {appointment.patientName}
                </p>

                <p className="mt-1 text-xs text-foreground-muted">
                    {appointment.scheduledDate}
                    {" · "}
                    {appointment.startTime}
                    {" · "}
                    {appointment.doctorName}
                </p>
            </div>

            <div>
                <label
                    htmlFor="cancellation-reason"
                    className="mb-2 block text-sm font-semibold text-foreground"
                >
                    Motivo de cancelación
                </label>

                <Textarea
                    id="cancellation-reason"
                    name="reason"
                    rows={5}
                    maxLength={500}
                    disabled={isPending}
                    hasError={hasError}
                    placeholder="Motivo opcional de la cancelación"
                />

                <p className="mt-2 text-xs leading-5 text-foreground-muted">
                    Este texto será visible en el historial administrativo y para el paciente.
                </p>
            </div>

            <div className="grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={onCancel}
                >
                    Conservar cita
                </Button>

                <Button
                    type="submit"
                    variant="danger"
                    disabled={
                        isPending ||
                        appointment.status !==
                        "SCHEDULED"
                    }
                >
                    {isPending ? (
                        <>
                            <LoaderCircle className="size-4 animate-spin" />
                            Cancelando...
                        </>
                    ) : (
                        <>
                            <CalendarX2 className="size-4" />
                            Cancelar cita
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}