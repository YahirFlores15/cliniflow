"use client";

import {
    Activity,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    FileText,
    HeartPulse,
    Pill,
    Search,
    Stethoscope,
    XCircle,
} from "lucide-react";
import {
    useMemo,
    useState,
} from "react";

import {
    Drawer,
} from "@/components/ui/drawer";
import {
    Badge,
} from "@/components/ui/badge";
import {
    Button,
} from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Select,
} from "@/components/ui/select";
import type {
    PatientHistoryItemDTO,
    PatientHistoryWorkspaceDTO,
} from "@/server/modules/patient/patient-history.service";
import type {
    PatientAppointmentDTO,
} from "@/shared/dtos/patient.dtos";


type PatientHistoryListProps = {
    workspace:
    PatientHistoryWorkspaceDTO;
};

type HistoryFilter =
    | "ALL"
    | "COMPLETED"
    | "CANCELLED"
    | "PENDING_UPDATE"
    | "WITH_NOTE";

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
            weekday:
                "long",
            day:
                "numeric",
            month:
                "long",
            year:
                "numeric",
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

function getStatusLabel(
    status:
        PatientAppointmentDTO["status"]
): string {
    if (
        status ===
        "COMPLETED"
    ) {
        return "Completada";
    }

    if (
        status ===
        "CANCELLED"
    ) {
        return "Cancelada";
    }

    return "Pendiente de actualización";
}

function getStatusVariant(
    status:
        PatientAppointmentDTO["status"]
):
    | "success"
    | "danger"
    | "warning" {
    if (
        status ===
        "COMPLETED"
    ) {
        return "success";
    }

    if (
        status ===
        "CANCELLED"
    ) {
        return "danger";
    }

    return "warning";
}

function ClinicalInformationCard({
    title,
    value,
    icon:
    Icon,
}: {
    title: string;
    value:
    string
    | null;
    icon:
    typeof Activity;
}) {
    return (
        <div className="rounded-2xl border border-border bg-surface-muted p-4">
            <div className="flex items-center gap-2">
                <Icon
                    className="size-4 text-primary"
                    strokeWidth={
                        1.9
                    }
                />

                <p className="text-sm font-semibold text-foreground">
                    {title}
                </p>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground-muted">
                {value?.trim() ||
                    "Sin información registrada."}
            </p>
        </div>
    );
}

function matchesFilter(
    item:
        PatientHistoryItemDTO,
    filter:
        HistoryFilter
): boolean {
    if (
        filter ===
        "COMPLETED"
    ) {
        return (
            item.appointment
                .status ===
            "COMPLETED"
        );
    }

    if (
        filter ===
        "CANCELLED"
    ) {
        return (
            item.appointment
                .status ===
            "CANCELLED"
        );
    }

    if (
        filter ===
        "PENDING_UPDATE"
    ) {
        return (
            item.appointment
                .status ===
            "SCHEDULED"
        );
    }

    if (
        filter ===
        "WITH_NOTE"
    ) {
        return (
            item.medicalNote !==
            null
        );
    }

    return true;
}

function matchesSearch(
    item:
        PatientHistoryItemDTO,
    search:
        string
): boolean {
    const normalizedSearch =
        search
            .trim()
            .toLocaleLowerCase(
                "es-MX"
            );

    if (!normalizedSearch) {
        return true;
    }

    const searchableText = [
        item.appointment
            .doctorName,
        item.appointment
            .specialty,
        item.appointment
            .reason,
        item.appointment
            .scheduledDate,
        item.medicalNote
            ?.diagnosis,
        item.medicalNote
            ?.treatment,
    ]
        .filter(
            Boolean
        )
        .join(
            " "
        )
        .toLocaleLowerCase(
            "es-MX"
        );

    return searchableText.includes(
        normalizedSearch
    );
}

export function PatientHistoryList({
    workspace,
}: PatientHistoryListProps) {
    const [
        filter,
        setFilter,
    ] =
        useState<HistoryFilter>(
            "ALL"
        );

    const [
        search,
        setSearch,
    ] =
        useState(
            ""
        );

    const [
        selectedAppointmentId,
        setSelectedAppointmentId,
    ] =
        useState<
            string
            | null
        >(
            null
        );

    const filteredItems =
        useMemo(
            () =>
                workspace.items.filter(
                    (
                        item
                    ) =>
                        matchesFilter(
                            item,
                            filter
                        ) &&
                        matchesSearch(
                            item,
                            search
                        )
                ),
            [
                workspace.items,
                filter,
                search,
            ]
        );

    const selectedItem =
        useMemo(
            () =>
                workspace.items.find(
                    (
                        item
                    ) =>
                        item.appointment
                            .id ===
                        selectedAppointmentId
                ) ??
                null,
            [
                workspace.items,
                selectedAppointmentId,
            ]
        );

    return (
        <>
            <Card>
                <CardContent className="space-y-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                                Consultas anteriores
                            </p>

                            <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                                Registro de atención
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-foreground-muted">
                                Busca por médico, especialidad, motivo o diagnóstico.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[580px]">
                            <label>
                                <span className="mb-2 block text-sm font-semibold text-foreground">
                                    Buscar
                                </span>

                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />

                                    <input
                                        type="search"
                                        value={
                                            search
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSearch(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Médico, diagnóstico o motivo"
                                        className="h-11 w-full rounded-xl border border-border-strong bg-surface py-2 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                            </label>

                            <label>
                                <span className="mb-2 block text-sm font-semibold text-foreground">
                                    Estado
                                </span>

                                <Select
                                    value={
                                        filter
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setFilter(
                                            event
                                                .target
                                                .value as HistoryFilter
                                        )
                                    }
                                >
                                    <option value="ALL">
                                        Todas las consultas
                                    </option>

                                    <option value="COMPLETED">
                                        Completadas
                                    </option>

                                    <option value="CANCELLED">
                                        Canceladas
                                    </option>

                                    <option value="PENDING_UPDATE">
                                        Pendientes de actualización
                                    </option>

                                    <option value="WITH_NOTE">
                                        Con nota médica
                                    </option>
                                </Select>
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                        <Badge variant="neutral">
                            {
                                filteredItems.length
                            }{" "}
                            resultados
                        </Badge>

                        {search ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    setSearch(
                                        ""
                                    )
                                }
                            >
                                Limpiar búsqueda
                            </Button>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            {filteredItems.length >
                0 ? (
                <div className="grid gap-4">
                    {filteredItems.map(
                        (
                            item
                        ) => (
                            <article
                                key={
                                    item
                                        .appointment
                                        .id
                                }
                                className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]"
                            >
                                <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                            <Stethoscope className="size-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base font-bold text-foreground">
                                                    Dr.{" "}
                                                    {
                                                        item
                                                            .appointment
                                                            .doctorName
                                                    }
                                                </h3>

                                                <Badge
                                                    variant={getStatusVariant(
                                                        item
                                                            .appointment
                                                            .status
                                                    )}
                                                >
                                                    {getStatusLabel(
                                                        item
                                                            .appointment
                                                            .status
                                                    )}
                                                </Badge>

                                                {item.medicalNote ? (
                                                    <Badge variant="primary">
                                                        Nota médica
                                                    </Badge>
                                                ) : null}
                                            </div>

                                            <p className="mt-1 text-sm text-foreground-muted">
                                                {item
                                                    .appointment
                                                    .specialty ??
                                                    "Especialidad no registrada"}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-foreground-muted">
                                                <span className="flex items-center gap-1.5 capitalize">
                                                    <CalendarDays className="size-3.5" />

                                                    {formatCalendarDate(
                                                        item
                                                            .appointment
                                                            .scheduledDate
                                                    )}
                                                </span>

                                                <span className="flex items-center gap-1.5">
                                                    <Clock3 className="size-3.5" />

                                                    {
                                                        item
                                                            .appointment
                                                            .startTime
                                                    }
                                                    {" – "}
                                                    {
                                                        item
                                                            .appointment
                                                            .endTime
                                                    }
                                                </span>
                                            </div>

                                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground-muted">
                                                {item
                                                    .appointment
                                                    .reason ??
                                                    "Sin motivo registrado."}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setSelectedAppointmentId(
                                                item
                                                    .appointment
                                                    .id
                                            )
                                        }
                                    >
                                        <ClipboardList className="size-4" />
                                        Ver detalle
                                    </Button>
                                </div>
                            </article>
                        )
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
                        <ClipboardList className="size-10 text-primary" />

                        <h3 className="mt-4 text-lg font-semibold text-foreground">
                            No se encontraron consultas
                        </h3>

                        <p className="mt-2 max-w-md text-sm leading-6 text-foreground-muted">
                            No existen consultas que coincidan con los filtros seleccionados.
                        </p>

                        <Button
                            type="button"
                            variant="outline"
                            className="mt-5"
                            onClick={() => {
                                setFilter(
                                    "ALL"
                                );

                                setSearch(
                                    ""
                                );
                            }}
                        >
                            Mostrar todo
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Drawer
                open={Boolean(
                    selectedItem
                )}
                title="Detalle de la consulta"
                description="Información administrativa y clínica disponible."
                onClose={() =>
                    setSelectedAppointmentId(
                        null
                    )
                }
            >
                {selectedItem ? (
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                                        Consulta
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold text-foreground">
                                        Dr.{" "}
                                        {
                                            selectedItem
                                                .appointment
                                                .doctorName
                                        }
                                    </h3>

                                    <p className="mt-1 text-sm text-foreground-muted">
                                        {selectedItem
                                            .appointment
                                            .specialty ??
                                            "Especialidad no registrada"}
                                    </p>
                                </div>

                                <Badge
                                    variant={getStatusVariant(
                                        selectedItem
                                            .appointment
                                            .status
                                    )}
                                >
                                    {getStatusLabel(
                                        selectedItem
                                            .appointment
                                            .status
                                    )}
                                </Badge>
                            </div>
                        </section>

                        <section className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border bg-surface-muted p-4">
                                <CalendarDays className="size-5 text-primary" />

                                <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                    Fecha
                                </p>

                                <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                                    {formatCalendarDate(
                                        selectedItem
                                            .appointment
                                            .scheduledDate
                                    )}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-surface-muted p-4">
                                <Clock3 className="size-5 text-secondary" />

                                <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                    Horario
                                </p>

                                <p className="mt-1 text-sm font-semibold text-foreground">
                                    {
                                        selectedItem
                                            .appointment
                                            .startTime
                                    }
                                    {" – "}
                                    {
                                        selectedItem
                                            .appointment
                                            .endTime
                                    }
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-foreground">
                                Motivo de consulta
                            </h3>

                            <div className="mt-3 rounded-2xl border border-border bg-surface-muted p-4">
                                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                                    {selectedItem
                                        .appointment
                                        .reason ??
                                        "Sin motivo registrado."}
                                </p>
                            </div>
                        </section>

                        {selectedItem
                            .appointment
                            .status ===
                            "CANCELLED" ? (
                            <section>
                                <h3 className="text-sm font-semibold text-danger">
                                    Motivo de cancelación
                                </h3>

                                <div className="mt-3 rounded-2xl border border-danger-border bg-danger-soft p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-danger">
                                        {selectedItem
                                            .appointment
                                            .cancellationReason ??
                                            "No se registró un motivo de cancelación."}
                                    </p>
                                </div>
                            </section>
                        ) : null}

                        {selectedItem.medicalNote ? (
                            <section className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-5 text-primary" />

                                        <h3 className="text-lg font-bold text-foreground">
                                            Nota médica
                                        </h3>
                                    </div>

                                    <p className="mt-1 text-sm leading-6 text-foreground-muted">
                                        Información registrada por el médico durante la consulta.
                                    </p>
                                </div>

                                <ClinicalInformationCard
                                    title="Motivo clínico"
                                    value={
                                        selectedItem
                                            .medicalNote
                                            .consultationReason
                                    }
                                    icon={
                                        ClipboardList
                                    }
                                />

                                <ClinicalInformationCard
                                    title="Diagnóstico"
                                    value={
                                        selectedItem
                                            .medicalNote
                                            .diagnosis
                                    }
                                    icon={
                                        Activity
                                    }
                                />

                                <ClinicalInformationCard
                                    title="Tratamiento"
                                    value={
                                        selectedItem
                                            .medicalNote
                                            .treatment
                                    }
                                    icon={
                                        HeartPulse
                                    }
                                />

                                <ClinicalInformationCard
                                    title="Receta"
                                    value={
                                        selectedItem
                                            .medicalNote
                                            .prescriptionText
                                    }
                                    icon={
                                        Pill
                                    }
                                />

                                <ClinicalInformationCard
                                    title="Indicaciones"
                                    value={
                                        selectedItem
                                            .medicalNote
                                            .instructionsText
                                    }
                                    icon={
                                        FileText
                                    }
                                />
                            </section>
                        ) : (
                            <section className="rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center">
                                {selectedItem
                                    .appointment
                                    .status ===
                                    "CANCELLED" ? (
                                    <XCircle className="mx-auto size-8 text-danger" />
                                ) : (
                                    <CheckCircle2 className="mx-auto size-8 text-foreground-muted" />
                                )}

                                <p className="mt-3 text-sm font-semibold text-foreground">
                                    Sin nota médica disponible
                                </p>

                                <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                    No existe información clínica asociada a esta consulta.
                                </p>
                            </section>
                        )}
                    </div>
                ) : null}
            </Drawer>
        </>
    );
}