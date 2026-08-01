"use client";

import {
    CalendarDays,
    CalendarOff,
    CalendarPlus,
    Clock3,
    Search,
    Stethoscope,
} from "lucide-react";
import Link from "next/link";
import {
    useMemo,
    useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import {
    buttonVariants,
    Button,
} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
    DoctorBlockDTO,
    DoctorOptionDTO,
    DoctorScheduleDTO,
} from "@/shared/dtos/staff.dtos";

type AvailabilityBoardProps = {
    doctors: DoctorOptionDTO[];
    schedules: DoctorScheduleDTO[];
    blocks: DoctorBlockDTO[];
};

const WEEKDAYS = [
    {
        value: 1,
        shortLabel: "Lun",
        label: "Lunes",
    },
    {
        value: 2,
        shortLabel: "Mar",
        label: "Martes",
    },
    {
        value: 3,
        shortLabel: "Mié",
        label: "Miércoles",
    },
    {
        value: 4,
        shortLabel: "Jue",
        label: "Jueves",
    },
    {
        value: 5,
        shortLabel: "Vie",
        label: "Viernes",
    },
    {
        value: 6,
        shortLabel: "Sáb",
        label: "Sábado",
    },
    {
        value: 7,
        shortLabel: "Dom",
        label: "Domingo",
    },
] as const;

function normalizeSearchValue(
    value: string
): string {
    return value
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}

function parseDateTime(
    value: string
): Date | null {
    const normalizedValue =
        value.includes(" ")
            ? value.replace(
                " ",
                "T"
            )
            : value;

    const parsedDate =
        new Date(
            normalizedValue
        );

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return null;
    }

    return parsedDate;
}

function formatDateTime(
    value: string
): string {
    const parsedDate =
        parseDateTime(value);

    if (!parsedDate) {
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

function isFutureBlock(
    block: DoctorBlockDTO,
    currentDateTime: Date
): boolean {
    const endDate =
        parseDateTime(
            block.endDateTime
        );

    if (!endDate) {
        return false;
    }

    return (
        endDate >=
        currentDateTime
    );
}

export function AvailabilityBoard({
    doctors,
    schedules,
    blocks,
}: AvailabilityBoardProps) {
    const [search, setSearch] =
        useState("");

    const [
        selectedDoctorId,
        setSelectedDoctorId,
    ] = useState("ALL");

    const currentDateTime =
        useMemo(
            () => new Date(),
            []
        );

    const filteredDoctors =
        useMemo(() => {
            const normalizedSearch =
                normalizeSearchValue(
                    search
                );

            return doctors.filter(
                (doctor) => {
                    const matchesDoctor =
                        selectedDoctorId ===
                        "ALL" ||
                        doctor.id ===
                        selectedDoctorId;

                    const searchableText =
                        normalizeSearchValue(
                            [
                                doctor.name,
                                doctor.email,
                                doctor.specialty ??
                                "",
                                doctor.licenseNumber ??
                                "",
                            ].join(" ")
                        );

                    const matchesSearch =
                        !normalizedSearch ||
                        searchableText.includes(
                            normalizedSearch
                        );

                    return (
                        matchesDoctor &&
                        matchesSearch
                    );
                }
            );
        }, [
            doctors,
            search,
            selectedDoctorId,
        ]);

    const totalWorkingDays =
        schedules.length;

    const futureBlocks =
        blocks.filter(
            (block) =>
                isFutureBlock(
                    block,
                    currentDateTime
                )
        ).length;

    function clearFilters(): void {
        setSearch("");
        setSelectedDoctorId(
            "ALL"
        );
    }

    const hasFilters =
        Boolean(search.trim()) ||
        selectedDoctorId !==
        "ALL";

    return (
        <div className="flex flex-col gap-6">
            <section className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">
                                Médicos activos
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                {
                                    doctors.length
                                }
                            </p>
                        </div>

                        <div className="flex size-11 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                            <Stethoscope
                                className="size-5"
                                strokeWidth={
                                    1.9
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">
                                Jornadas activas
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                {
                                    totalWorkingDays
                                }
                            </p>
                        </div>

                        <div className="flex size-11 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                            <CalendarDays
                                className="size-5"
                                strokeWidth={
                                    1.9
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-foreground-muted">
                                Bloqueos vigentes
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                                {
                                    futureBlocks
                                }
                            </p>
                        </div>

                        <div className="flex size-11 items-center justify-center rounded-xl border border-warning-border bg-warning-soft text-warning-hover">
                            <CalendarOff
                                className="size-5"
                                strokeWidth={
                                    1.9
                                }
                            />
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Consultar disponibilidad
                    </CardTitle>

                    <CardDescription>
                        Filtra los horarios y bloqueos por médico, especialidad, correo o cédula.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 md:grid-cols-[1fr_280px_auto] md:items-end">
                        <div>
                            <label
                                htmlFor="availability-search"
                                className="mb-2 block text-sm font-semibold text-foreground"
                            >
                                Buscar
                            </label>

                            <Input
                                id="availability-search"
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
                                placeholder="Nombre, especialidad, correo o cédula"
                                leadingIcon={
                                    <Search
                                        className="size-4.5"
                                        strokeWidth={
                                            1.9
                                        }
                                    />
                                }
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="availability-doctor"
                                className="mb-2 block text-sm font-semibold text-foreground"
                            >
                                Médico
                            </label>

                            <Select
                                id="availability-doctor"
                                value={
                                    selectedDoctorId
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedDoctorId(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="ALL">
                                    Todos los médicos
                                </option>

                                {doctors.map(
                                    (doctor) => (
                                        <option
                                            key={
                                                doctor.id
                                            }
                                            value={
                                                doctor.id
                                            }
                                        >
                                            {
                                                doctor.name
                                            }
                                        </option>
                                    )
                                )}
                            </Select>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                !hasFilters
                            }
                            onClick={
                                clearFilters
                            }
                        >
                            Limpiar
                        </Button>
                    </div>

                    <p className="mt-4 text-sm text-foreground-muted">
                        Mostrando{" "}
                        {
                            filteredDoctors.length
                        }{" "}
                        de{" "}
                        {
                            doctors.length
                        }{" "}
                        médicos.
                    </p>
                </CardContent>
            </Card>

            <section className="space-y-6">
                {filteredDoctors.map(
                    (doctor) => {
                        const doctorSchedules =
                            schedules
                                .filter(
                                    (
                                        schedule
                                    ) =>
                                        schedule.doctorId ===
                                        doctor.id
                                )
                                .sort(
                                    (
                                        first,
                                        second
                                    ) =>
                                        first.weekday -
                                        second.weekday
                                );

                        const doctorBlocks =
                            blocks
                                .filter(
                                    (
                                        block
                                    ) =>
                                        block.doctorId ===
                                        doctor.id
                                )
                                .sort(
                                    (
                                        first,
                                        second
                                    ) =>
                                        first.startDateTime.localeCompare(
                                            second.startDateTime
                                        )
                                );

                        const upcomingBlocks =
                            doctorBlocks.filter(
                                (
                                    block
                                ) =>
                                    isFutureBlock(
                                        block,
                                        currentDateTime
                                    )
                            );

                        return (
                            <Card
                                key={
                                    doctor.id
                                }
                                className="overflow-hidden"
                            >
                                <CardHeader className="border-b border-border bg-surface-muted/50">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                                                <Stethoscope
                                                    className="size-6"
                                                    strokeWidth={
                                                        1.9
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <CardTitle>
                                                    {
                                                        doctor.name
                                                    }
                                                </CardTitle>

                                                <CardDescription className="mt-1">
                                                    {doctor.specialty ??
                                                        "Sin especialidad registrada"}
                                                </CardDescription>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Badge variant="primary">
                                                        {
                                                            doctor.defaultAppointmentDurationMinutes
                                                        }{" "}
                                                        min por cita
                                                    </Badge>

                                                    <Badge variant="neutral">
                                                        {
                                                            doctorSchedules.length
                                                        }{" "}
                                                        días activos
                                                    </Badge>

                                                    {upcomingBlocks.length >
                                                        0 ? (
                                                        <Badge variant="warning">
                                                            {
                                                                upcomingBlocks.length
                                                            }{" "}
                                                            bloqueos
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="success">
                                                            Sin bloqueos próximos
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/staff/appointments/new?doctorId=${encodeURIComponent(
                                                doctor.id
                                            )}`}
                                            className={cn(
                                                buttonVariants(
                                                    {
                                                        variant:
                                                            "primary",
                                                        size: "sm",
                                                    }
                                                ),
                                                "w-full lg:w-auto"
                                            )}
                                        >
                                            <CalendarPlus className="size-4" />
                                            Agendar cita
                                        </Link>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-7">
                                    <section>
                                        <div className="flex items-center gap-2">
                                            <Clock3
                                                className="size-4.5 text-primary"
                                                strokeWidth={
                                                    1.9
                                                }
                                            />

                                            <h3 className="text-sm font-semibold text-foreground">
                                                Horario semanal
                                            </h3>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                            {WEEKDAYS.map(
                                                (
                                                    weekday
                                                ) => {
                                                    const schedule =
                                                        doctorSchedules.find(
                                                            (
                                                                item
                                                            ) =>
                                                                item.weekday ===
                                                                weekday.value
                                                        );

                                                    return (
                                                        <div
                                                            key={
                                                                weekday.value
                                                            }
                                                            className={cn(
                                                                "rounded-2xl border p-4",
                                                                schedule
                                                                    ? "border-secondary-border bg-secondary-soft"
                                                                    : "border-border bg-surface-muted"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {
                                                                        weekday.label
                                                                    }
                                                                </p>

                                                                <Badge
                                                                    variant={
                                                                        schedule
                                                                            ? "success"
                                                                            : "neutral"
                                                                    }
                                                                >
                                                                    {schedule
                                                                        ? "Activo"
                                                                        : "Descanso"}
                                                                </Badge>
                                                            </div>

                                                            {schedule ? (
                                                                <>
                                                                    <p className="mt-4 text-lg font-bold tracking-tight text-foreground">
                                                                        {
                                                                            schedule.startTime
                                                                        }
                                                                        {" – "}
                                                                        {
                                                                            schedule.endTime
                                                                        }
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-foreground-muted">
                                                                        Citas de{" "}
                                                                        {
                                                                            schedule.appointmentDurationMinutes
                                                                        }{" "}
                                                                        minutos
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="mt-4 text-sm text-foreground-muted">
                                                                    Sin atención programada.
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarOff
                                                    className="size-4.5 text-warning-hover"
                                                    strokeWidth={
                                                        1.9
                                                    }
                                                />

                                                <h3 className="text-sm font-semibold text-foreground">
                                                    Bloqueos próximos
                                                </h3>
                                            </div>

                                            <Badge variant="warning">
                                                {
                                                    upcomingBlocks.length
                                                }
                                            </Badge>
                                        </div>

                                        {upcomingBlocks.length >
                                            0 ? (
                                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                {upcomingBlocks.map(
                                                    (
                                                        block
                                                    ) => (
                                                        <div
                                                            key={
                                                                block.id
                                                            }
                                                            className="rounded-2xl border border-warning-border bg-warning-soft p-4"
                                                        >
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {formatDateTime(
                                                                    block.startDateTime
                                                                )}
                                                            </p>

                                                            <p className="mt-1 text-xs text-foreground-muted">
                                                                Hasta{" "}
                                                                {formatDateTime(
                                                                    block.endDateTime
                                                                )}
                                                            </p>

                                                            <p className="mt-3 text-sm leading-6 text-foreground">
                                                                {block.reason ??
                                                                    "Sin motivo registrado."}
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface-muted px-5 py-8 text-center">
                                                <p className="text-sm font-semibold text-foreground">
                                                    Sin bloqueos próximos
                                                </p>

                                                <p className="mt-1 text-xs text-foreground-muted">
                                                    El médico no tiene periodos futuros bloqueados.
                                                </p>
                                            </div>
                                        )}
                                    </section>
                                </CardContent>
                            </Card>
                        );
                    }
                )}

                {filteredDoctors.length ===
                    0 ? (
                    <Card>
                        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
                            <Search className="size-9 text-primary" />

                            <h3 className="mt-4 text-lg font-semibold text-foreground">
                                No se encontraron médicos
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-foreground-muted">
                                Ajusta los filtros para consultar otros perfiles médicos.
                            </p>

                            <Button
                                type="button"
                                variant="outline"
                                className="mt-5"
                                onClick={
                                    clearFilters
                                }
                            >
                                Limpiar filtros
                            </Button>
                        </CardContent>
                    </Card>
                ) : null}
            </section>
        </div>
    );
}