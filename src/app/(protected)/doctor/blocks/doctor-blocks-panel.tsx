"use client";

import {
    Ban,
    CalendarClock,
    CalendarX2,
    Clock3,
    Eye,
    ShieldAlert,
    Trash2,
    UserRound,
} from "lucide-react";
import {
    useActionState,
    useState,
} from "react";

import {
    createDoctorBlockWorkspaceAction,
    deleteDoctorBlockWorkspaceAction,
    previewDoctorBlockAction,
    type DoctorBlockActionState,
    type DoctorBlockPreviewActionState,
} from "@/server/modules/doctor/doctor-block.actions";
import type {
    DoctorBlockDTO,
} from "@/shared/dtos/doctor.dtos";
import {
    ActionMessage,
} from "@/components/feedback/action-message";
import {
    Badge,
} from "@/components/ui/badge";
import {
    Button,
} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Input,
} from "@/components/ui/input";
import {
    Textarea,
} from "@/components/ui/textarea";

type DoctorBlocksPanelProps = {
    blocks:
    DoctorBlockDTO[];
};

type BlockFormValues = {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    reason: string;
};

const initialBlockState:
    DoctorBlockActionState = {
    ok: false,
    message: "",
};

const initialPreviewState:
    DoctorBlockPreviewActionState = {
    ok: false,
    message: "",
    preview: null,
};

function getLocalCalendarDate(): string {
    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}

function formatCalendarDate(
    value: string
): string {
    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            value
        );

    if (!match) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            dateStyle:
                "medium",
        }
    ).format(
        new Date(
            Number(
                match[1]
            ),
            Number(
                match[2]
            ) - 1,
            Number(
                match[3]
            )
        )
    );
}

function formatDateTime(
    value: string
): string {
    const match =
        /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)$/.exec(
            value
        );

    if (!match) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            dateStyle:
                "medium",
            timeStyle:
                "short",
        }
    ).format(
        new Date(
            Number(
                match[1]
            ),
            Number(
                match[2]
            ) - 1,
            Number(
                match[3]
            ),
            Number(
                match[4]
            ),
            Number(
                match[5]
            )
        )
    );
}

function HiddenBlockFields({
    values,
}: {
    values:
    BlockFormValues;
}) {
    return (
        <>
            <input
                type="hidden"
                name="startDate"
                value={
                    values.startDate
                }
            />

            <input
                type="hidden"
                name="startTime"
                value={
                    values.startTime
                }
            />

            <input
                type="hidden"
                name="endDate"
                value={
                    values.endDate
                }
            />

            <input
                type="hidden"
                name="endTime"
                value={
                    values.endTime
                }
            />

            <input
                type="hidden"
                name="reason"
                value={
                    values.reason
                }
            />
        </>
    );
}

function DeleteBlockForm({
    blockId,
}: {
    blockId: string;
}) {
    const [
        state,
        formAction,
        pending,
    ] =
        useActionState(
            deleteDoctorBlockWorkspaceAction,
            initialBlockState
        );

    return (
        <form
            action={
                formAction
            }
            className="shrink-0"
        >
            <input
                type="hidden"
                name="blockId"
                value={
                    blockId
                }
            />

            <Button
                type="submit"
                variant="danger"
                size="sm"
                disabled={
                    pending
                }
            >
                <Trash2 className="size-4" />

                {pending
                    ? "Eliminando..."
                    : "Eliminar"}
            </Button>

            {state.message ? (
                <p
                    className={
                        state.ok
                            ? "mt-2 max-w-xs text-xs text-secondary"
                            : "mt-2 max-w-xs text-xs text-danger"
                    }
                >
                    {
                        state.message
                    }
                </p>
            ) : null}
        </form>
    );
}

export function DoctorBlocksPanel({
    blocks,
}: DoctorBlocksPanelProps) {
    const today =
        useState(
            getLocalCalendarDate
        )[0];

    const [
        values,
        setValues,
    ] =
        useState<BlockFormValues>(
            {
                startDate:
                    "",
                startTime:
                    "",
                endDate:
                    "",
                endTime:
                    "",
                reason:
                    "",
            }
        );

    const [
        previewState,
        previewAction,
        previewPending,
    ] =
        useActionState(
            previewDoctorBlockAction,
            initialPreviewState
        );

    const [
        createState,
        createAction,
        createPending,
    ] =
        useActionState(
            createDoctorBlockWorkspaceAction,
            initialBlockState
        );

    function updateValue(
        field:
            keyof BlockFormValues,
        value: string
    ): void {
        setValues(
            (
                currentValues
            ) => ({
                ...currentValues,
                [field]:
                    value,
            })
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-warning-border bg-warning-soft text-warning-hover">
                            <Ban className="size-5" />
                        </div>

                        <div>
                            <CardTitle>
                                Crear bloqueo
                            </CardTitle>

                            <CardDescription className="mt-1">
                                Define un periodo en el que no estarás disponible para consultas.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                Fecha inicial
                            </span>

                            <Input
                                type="date"
                                min={
                                    today
                                }
                                value={
                                    values.startDate
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateValue(
                                        "startDate",
                                        event.target.value
                                    )
                                }
                                className="mt-2"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                Hora inicial
                            </span>

                            <Input
                                type="time"
                                value={
                                    values.startTime
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateValue(
                                        "startTime",
                                        event.target.value
                                    )
                                }
                                className="mt-2"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                Fecha final
                            </span>

                            <Input
                                type="date"
                                min={
                                    today
                                }
                                value={
                                    values.endDate
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateValue(
                                        "endDate",
                                        event.target.value
                                    )
                                }
                                className="mt-2"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-foreground">
                                Hora final
                            </span>

                            <Input
                                type="time"
                                value={
                                    values.endTime
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateValue(
                                        "endTime",
                                        event.target.value
                                    )
                                }
                                className="mt-2"
                            />
                        </label>
                    </div>

                    <label className="mt-5 block">
                        <span className="text-sm font-semibold text-foreground">
                            Motivo
                        </span>

                        <Textarea
                            rows={4}
                            maxLength={
                                500
                            }
                            value={
                                values.reason
                            }
                            onChange={(
                                event
                            ) =>
                                updateValue(
                                    "reason",
                                    event.target.value
                                )
                            }
                            placeholder="Vacaciones, capacitación, asunto personal o cualquier otro motivo."
                            className="mt-2"
                        />
                    </label>

                    <div className="mt-5 rounded-2xl border border-warning-border bg-warning-soft p-4">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning-hover" />

                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Consecuencia del bloqueo
                                </p>

                                <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                    Las citas programadas que se superpongan con este periodo se cancelarán automáticamente. Eliminarlas del bloqueo después no reactivará esas citas.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <form
                            action={
                                previewAction
                            }
                        >
                            <HiddenBlockFields
                                values={
                                    values
                                }
                            />

                            <Button
                                type="submit"
                                variant="outline"
                                size="lg"
                                disabled={
                                    previewPending
                                }
                                className="w-full sm:w-auto"
                            >
                                <Eye className="size-4" />

                                {previewPending
                                    ? "Revisando..."
                                    : "Revisar afectación"}
                            </Button>
                        </form>

                        <form
                            action={
                                createAction
                            }
                        >
                            <HiddenBlockFields
                                values={
                                    values
                                }
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={
                                    createPending
                                }
                                className="w-full sm:w-auto"
                            >
                                <Ban className="size-4" />

                                {createPending
                                    ? "Creando bloqueo..."
                                    : "Confirmar bloqueo"}
                            </Button>
                        </form>
                    </div>

                    {previewState.message ? (
                        <div className="mt-5">
                            <ActionMessage
                                variant={
                                    previewState.ok
                                        ? "success"
                                        : "error"
                                }
                            >
                                {
                                    previewState.message
                                }
                            </ActionMessage>
                        </div>
                    ) : null}

                    {createState.message ? (
                        <div className="mt-5">
                            <ActionMessage
                                variant={
                                    createState.ok
                                        ? "success"
                                        : "error"
                                }
                            >
                                {
                                    createState.message
                                }
                            </ActionMessage>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {previewState.preview ? (
                <Card>
                    <CardHeader className="flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>
                                Vista previa de afectación
                            </CardTitle>

                            <CardDescription>
                                Citas programadas que se cancelarían con el periodo revisado.
                            </CardDescription>
                        </div>

                        <Badge
                            variant={
                                previewState.preview
                                    .affectedAppointmentsCount >
                                    0
                                    ? "warning"
                                    : "success"
                            }
                        >
                            {
                                previewState.preview
                                    .affectedAppointmentsCount
                            }{" "}
                            afectadas
                        </Badge>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                    Inicio
                                </p>

                                <p className="mt-1 text-sm font-semibold text-foreground">
                                    {formatDateTime(
                                        previewState.preview
                                            .startDateTime
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3">
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                    Final
                                </p>

                                <p className="mt-1 text-sm font-semibold text-foreground">
                                    {formatDateTime(
                                        previewState.preview
                                            .endDateTime
                                    )}
                                </p>
                            </div>
                        </div>

                        {previewState.preview
                            .affectedAppointments
                            .length ===
                            0 ? (
                            <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface-muted px-6 py-10 text-center">
                                <CalendarClock className="mx-auto size-9 text-secondary" />

                                <p className="mt-3 text-sm font-semibold text-foreground">
                                    No hay citas afectadas
                                </p>

                                <p className="mt-1 text-xs text-foreground-muted">
                                    El periodo puede bloquearse sin cancelar consultas programadas.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border">
                                {previewState.preview
                                    .affectedAppointments
                                    .map(
                                        (
                                            appointment
                                        ) => (
                                            <div
                                                key={
                                                    appointment.id
                                                }
                                                className="flex flex-col gap-3 bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <UserRound className="size-4 shrink-0 text-primary" />

                                                        <p className="truncate text-sm font-semibold text-foreground">
                                                            {
                                                                appointment.patientName
                                                            }
                                                        </p>
                                                    </div>

                                                    <p className="mt-2 text-xs text-foreground-muted">
                                                        {formatCalendarDate(
                                                            appointment.scheduledDate
                                                        )}
                                                        {
                                                            " · "
                                                        }
                                                        {
                                                            appointment.startTime
                                                        }
                                                        {
                                                            " – "
                                                        }
                                                        {
                                                            appointment.endTime
                                                        }
                                                    </p>

                                                    <p className="mt-1 truncate text-xs text-foreground-muted">
                                                        {appointment.reason ??
                                                            "Sin motivo de consulta registrado"}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="danger">
                                                        Se cancelará
                                                    </Badge>

                                                    <Badge variant="neutral">
                                                        {
                                                            appointment.durationMinutes
                                                        }{" "}
                                                        min
                                                    </Badge>
                                                </div>
                                            </div>
                                        )
                                    )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : null}

            <Card>
                <CardHeader className="flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle>
                            Bloqueos vigentes y futuros
                        </CardTitle>

                        <CardDescription>
                            Periodos registrados que todavía no han finalizado.
                        </CardDescription>
                    </div>

                    <Badge variant="warning">
                        {
                            blocks.length
                        }
                    </Badge>
                </CardHeader>

                <CardContent>
                    {blocks.length ===
                        0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-surface-muted px-6 py-12 text-center">
                            <Ban className="mx-auto size-9 text-warning-hover" />

                            <p className="mt-4 text-sm font-semibold text-foreground">
                                No tienes bloqueos vigentes
                            </p>

                            <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                Tu disponibilidad no tiene periodos futuros bloqueados.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {blocks.map(
                                (
                                    block
                                ) => (
                                    <article
                                        key={
                                            block.id
                                        }
                                        className="rounded-2xl border border-warning-border bg-warning-soft p-5"
                                    >
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CalendarX2 className="size-5 text-warning-hover" />

                                                    <h3 className="font-semibold text-foreground">
                                                        Periodo no disponible
                                                    </h3>
                                                </div>

                                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                    <div className="rounded-xl border border-warning-border bg-surface px-4 py-3">
                                                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-foreground-muted">
                                                            Inicio
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold text-foreground">
                                                            {formatDateTime(
                                                                block.startDateTime
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-warning-border bg-surface px-4 py-3">
                                                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-foreground-muted">
                                                            Final
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold text-foreground">
                                                            {formatDateTime(
                                                                block.endDateTime
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-start gap-2 text-sm text-foreground">
                                                    <Clock3 className="mt-0.5 size-4 shrink-0 text-warning-hover" />

                                                    <p className="whitespace-pre-wrap leading-6">
                                                        {block.reason ??
                                                            "Sin motivo registrado."}
                                                    </p>
                                                </div>
                                            </div>

                                            <DeleteBlockForm
                                                blockId={
                                                    block.id
                                                }
                                            />
                                        </div>
                                    </article>
                                )
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}