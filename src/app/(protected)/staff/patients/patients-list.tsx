"use client";

import {
    CalendarDays,
    Mail,
    Pencil,
    Phone,
    Search,
    UserPlus,
    UsersRound,
} from "lucide-react";
import Link from "next/link";
import {
    useMemo,
    useState,
} from "react";

import { ActionMessage } from "@/components/feedback/action-message";
import { Badge } from "@/components/ui/badge";
import {
    Button,
    buttonVariants,
} from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { PatientDTO } from "@/shared/dtos/staff.dtos";
import type { PatientSex } from "@/shared/schemas/staff.schemas";

type PatientsListProps = {
    patients: PatientDTO[];
    createdSuccessfully: boolean;
    updatedSuccessfully: boolean;
};

type PatientStatusFilter =
    | "ALL"
    | "ACTIVE"
    | "INACTIVE";

const PATIENT_SEX_LABELS: Record<
    PatientSex,
    string
> = {
    MALE: "Masculino",
    FEMALE: "Femenino",
    OTHER: "Otro",
    UNSPECIFIED: "Sin especificar",
};

function normalizeSearchValue(
    value: string
): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function formatDate(
    value: string | null
): string {
    if (!value) {
        return "Sin registrar";
    }

    const [year, month, day] =
        value.split("-").map(Number);

    if (!year || !month || !day) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "es-MX",
        {
            dateStyle: "medium",
        }
    ).format(
        new Date(year, month - 1, day)
    );
}

function getSexLabel(
    sex: PatientSex | null
): string {
    if (!sex) {
        return "Sin registrar";
    }

    return PATIENT_SEX_LABELS[sex];
}

export function PatientsList({
    patients,
    createdSuccessfully,
    updatedSuccessfully,
}: PatientsListProps) {
    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState<PatientStatusFilter>("ALL");

    const filteredPatients = useMemo(() => {
        const normalizedSearch =
            normalizeSearchValue(search);

        return patients.filter((patient) => {
            const matchesSearch =
                !normalizedSearch ||
                normalizeSearchValue(
                    patient.name
                ).includes(normalizedSearch) ||
                normalizeSearchValue(
                    patient.email
                ).includes(normalizedSearch) ||
                normalizeSearchValue(
                    patient.phone ?? ""
                ).includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" &&
                    patient.isActive) ||
                (statusFilter === "INACTIVE" &&
                    !patient.isActive);

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        patients,
        search,
        statusFilter,
    ]);

    const hasActiveFilters =
        Boolean(search.trim()) ||
        statusFilter !== "ALL";

    function clearFilters(): void {
        setSearch("");
        setStatusFilter("ALL");
    }

    return (
        <div className="flex flex-col gap-5">
            {createdSuccessfully ? (
                <ActionMessage variant="success">
                    El paciente fue registrado correctamente y ya puede acceder a ClinicFlow.
                </ActionMessage>
            ) : null}

            {updatedSuccessfully ? (
                <ActionMessage variant="success">
                    Los datos administrativos del paciente fueron actualizados correctamente.
                </ActionMessage>
            ) : null}

            <Card>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                        <div>
                            <label
                                htmlFor="patient-search"
                                className="mb-2 block text-sm font-semibold text-foreground"
                            >
                                Buscar paciente
                            </label>

                            <Input
                                id="patient-search"
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                leadingIcon={
                                    <Search
                                        className="size-4.5"
                                        strokeWidth={1.9}
                                    />
                                }
                                placeholder="Nombre, correo o teléfono"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="patient-status"
                                className="mb-2 block text-sm font-semibold text-foreground"
                            >
                                Estado
                            </label>

                            <Select
                                id="patient-status"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target
                                            .value as PatientStatusFilter
                                    )
                                }
                            >
                                <option value="ALL">
                                    Todos los estados
                                </option>

                                <option value="ACTIVE">
                                    Activos
                                </option>

                                <option value="INACTIVE">
                                    Inactivos
                                </option>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-foreground-muted">
                            Mostrando{" "}
                            <span className="font-semibold text-foreground">
                                {filteredPatients.length}
                            </span>{" "}
                            de{" "}
                            <span className="font-semibold text-foreground">
                                {patients.length}
                            </span>{" "}
                            pacientes
                        </p>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            {hasActiveFilters ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    Limpiar filtros
                                </Button>
                            ) : null}

                            <Link
                                href="/staff/patients/new"
                                className={buttonVariants({
                                    variant: "primary",
                                    size: "sm",
                                })}
                            >
                                <UserPlus className="size-4" />
                                Registrar paciente
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredPatients.length > 0 ? (
                <>
                    <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)] lg:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-left">
                                <thead className="border-b border-border bg-surface-muted">
                                    <tr className="text-xs font-bold uppercase tracking-[0.1em] text-foreground-muted">
                                        <th className="px-6 py-4">
                                            Paciente
                                        </th>

                                        <th className="px-6 py-4">
                                            Contacto
                                        </th>

                                        <th className="px-6 py-4">
                                            Nacimiento
                                        </th>

                                        <th className="px-6 py-4">
                                            Sexo
                                        </th>

                                        <th className="px-6 py-4">
                                            Estado
                                        </th>

                                        <th className="px-6 py-4 text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border">
                                    {filteredPatients.map(
                                        (patient) => (
                                            <tr
                                                key={
                                                    patient.id
                                                }
                                                className="transition hover:bg-surface-muted/60"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                                            <UsersRound
                                                                className="size-5"
                                                                strokeWidth={
                                                                    1.9
                                                                }
                                                            />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="max-w-64 truncate text-sm font-semibold text-foreground">
                                                                {
                                                                    patient.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 max-w-72 truncate text-xs text-foreground-muted">
                                                                {
                                                                    patient.email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="space-y-1.5 text-sm text-foreground-muted">
                                                        <p className="flex items-center gap-2">
                                                            <Mail className="size-4 shrink-0" />

                                                            <span className="max-w-56 truncate">
                                                                {
                                                                    patient.email
                                                                }
                                                            </span>
                                                        </p>

                                                        <p className="flex items-center gap-2">
                                                            <Phone className="size-4 shrink-0" />

                                                            <span>
                                                                {patient.phone ??
                                                                    "Sin teléfono"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-foreground-muted">
                                                    {formatDate(
                                                        patient.birthDate
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-foreground-muted">
                                                    {getSexLabel(
                                                        patient.sex
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <Badge
                                                        variant={
                                                            patient.isActive
                                                                ? "success"
                                                                : "danger"
                                                        }
                                                    >
                                                        {patient.isActive
                                                            ? "Activo"
                                                            : "Inactivo"}
                                                    </Badge>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end">
                                                        <Link
                                                            href={`/staff/patients/edit?patientId=${encodeURIComponent(
                                                                patient.id
                                                            )}`}
                                                            className={buttonVariants({
                                                                variant:
                                                                    "outline",
                                                                size: "sm",
                                                            })}
                                                        >
                                                            <Pencil className="size-4" />
                                                            Editar
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:hidden">
                        {filteredPatients.map(
                            (patient) => (
                                <Card key={patient.id}>
                                    <CardContent>
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                                <UsersRound
                                                    className="size-5"
                                                    strokeWidth={
                                                        1.9
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {
                                                        patient.name
                                                    }
                                                </p>

                                                <p className="mt-1 truncate text-xs text-foreground-muted">
                                                    {
                                                        patient.email
                                                    }
                                                </p>
                                            </div>

                                            <Badge
                                                variant={
                                                    patient.isActive
                                                        ? "success"
                                                        : "danger"
                                                }
                                            >
                                                {patient.isActive
                                                    ? "Activo"
                                                    : "Inactivo"}
                                            </Badge>
                                        </div>

                                        <div className="mt-4 grid gap-3 rounded-2xl bg-surface-muted p-4 text-sm text-foreground-muted sm:grid-cols-2">
                                            <p className="flex items-center gap-2">
                                                <Phone className="size-4 shrink-0" />

                                                <span className="truncate">
                                                    {patient.phone ??
                                                        "Sin teléfono"}
                                                </span>
                                            </p>

                                            <p className="flex items-center gap-2">
                                                <CalendarDays className="size-4 shrink-0" />

                                                <span>
                                                    {formatDate(
                                                        patient.birthDate
                                                    )}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="mt-4">
                                            <Link
                                                href={`/staff/patients/edit?patientId=${encodeURIComponent(
                                                    patient.id
                                                )}`}
                                                className={`${buttonVariants({
                                                    variant:
                                                        "outline",
                                                    size: "sm",
                                                })} w-full`}
                                            >
                                                <Pencil className="size-4" />
                                                Editar paciente
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        )}
                    </div>
                </>
            ) : (
                <Card>
                    <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                            <Search
                                className="size-6"
                                strokeWidth={1.9}
                            />
                        </div>

                        <h3 className="mt-5 text-lg font-semibold text-foreground">
                            No encontramos pacientes
                        </h3>

                        <p className="mt-2 max-w-md text-sm leading-6 text-foreground-muted">
                            Ajusta la búsqueda o limpia los
                            filtros para volver a mostrar los
                            pacientes registrados.
                        </p>

                        {hasActiveFilters ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-5"
                                onClick={clearFilters}
                            >
                                Limpiar filtros
                            </Button>
                        ) : null}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}