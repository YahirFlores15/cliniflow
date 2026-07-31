"use client";

import {
    CalendarClock,
    CalendarPlus,
    CircleAlert,
    Pencil,
    Search,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import { useActionState, useMemo, useState } from "react";

import {
    cancelAppointmentAction,
    createAppointmentAction,
    createPatientAction,
    rescheduleAppointmentAction,
    type StaffActionState,
    updatePatientAction,
} from "@/server/modules/staff/staff.actions";
import type {
    AppointmentDTO,
    DoctorOptionDTO,
    PatientDTO,
} from "@/shared/dtos/staff.dtos";
import type {
    AppointmentStatus,
    PatientSex,
} from "@/shared/schemas/staff.schemas";

type StaffPanelProps = {
    patients: PatientDTO[];
    doctors: DoctorOptionDTO[];
    appointments: AppointmentDTO[];
};

type ActiveSection = "PATIENTS" | "APPOINTMENTS";

const initialStaffActionState: StaffActionState = {
    ok: false,
    message: "",
};

const patientSexLabels: Record<PatientSex, string> = {
    MALE: "Masculino",
    FEMALE: "Femenino",
    OTHER: "Otro",
    UNSPECIFIED: "Prefiere no especificar",
};

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
    SCHEDULED: "Programada",
    CANCELLED: "Cancelada",
    COMPLETED: "Completada",
};

function formatDate(value: string | null): string {
    if (!value) {
        return "Sin registrar";
    }

    const dateParts = value.split("-");

    if (dateParts.length === 3) {
        const year = Number(dateParts[0]);
        const month = Number(dateParts[1]);
        const day = Number(dateParts[2]);

        const localDate = new Date(year, month - 1, day);

        return new Intl.DateTimeFormat("es-MX", {
            dateStyle: "medium",
        }).format(localDate);
    }

    return value;
}

function formatDateTime(value: string): string {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsedDate);
}

function getPatientSexLabel(sex: PatientSex | null): string {
    if (!sex) {
        return "Sin registrar";
    }

    return patientSexLabels[sex];
}

function getStatusClasses(status: AppointmentStatus): string {
    if (status === "SCHEDULED") {
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
    }

    if (status === "COMPLETED") {
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    }

    return "border-red-500/30 bg-red-500/10 text-red-200";
}

function ActionMessage({
    state,
    className = "",
}: {
    state: StaffActionState;
    className?: string;
}) {
    if (!state.message) {
        return null;
    }

    return (
        <div
            className={`${className} rounded-xl border px-4 py-3 text-sm ${state.ok
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-red-500/30 bg-red-500/10 text-red-200"
                }`}
        >
            {state.message}
        </div>
    );
}

export function StaffPanel(props: StaffPanelProps) {
    const [activeSection, setActiveSection] =
        useState<ActiveSection>("PATIENTS");

    const [patientSearch, setPatientSearch] = useState("");
    const [editingPatientId, setEditingPatientId] =
        useState<string | null>(null);

    const [reschedulingAppointmentId, setReschedulingAppointmentId] =
        useState<string | null>(null);

    const [cancellingAppointmentId, setCancellingAppointmentId] =
        useState<string | null>(null);

    const [appointmentStatusFilter, setAppointmentStatusFilter] =
        useState<AppointmentStatus | "ALL">("ALL");

    const [appointmentDoctorFilter, setAppointmentDoctorFilter] =
        useState("ALL");

    const [appointmentDateFilter, setAppointmentDateFilter] =
        useState("");

    const [
        createPatientState,
        createPatientFormAction,
        createPatientPending,
    ] = useActionState(
        createPatientAction,
        initialStaffActionState
    );

    const [
        updatePatientState,
        updatePatientFormAction,
        updatePatientPending,
    ] = useActionState(
        updatePatientAction,
        initialStaffActionState
    );

    const [
        createAppointmentState,
        createAppointmentFormAction,
        createAppointmentPending,
    ] = useActionState(
        createAppointmentAction,
        initialStaffActionState
    );

    const [
        rescheduleAppointmentState,
        rescheduleAppointmentFormAction,
        rescheduleAppointmentPending,
    ] = useActionState(
        rescheduleAppointmentAction,
        initialStaffActionState
    );

    const [
        cancelAppointmentState,
        cancelAppointmentFormAction,
        cancelAppointmentPending,
    ] = useActionState(
        cancelAppointmentAction,
        initialStaffActionState
    );

    const editingPatient = props.patients.find(
        (patient) => patient.id === editingPatientId
    );

    const reschedulingAppointment = props.appointments.find(
        (appointment) =>
            appointment.id === reschedulingAppointmentId
    );

    const cancellingAppointment = props.appointments.find(
        (appointment) =>
            appointment.id === cancellingAppointmentId
    );

    const filteredPatients = useMemo(() => {
        const query = patientSearch.trim().toLowerCase();

        if (!query) {
            return props.patients;
        }

        return props.patients.filter((patient) => {
            return (
                patient.name.toLowerCase().includes(query) ||
                patient.email.toLowerCase().includes(query) ||
                (patient.phone ?? "")
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [patientSearch, props.patients]);

    const filteredAppointments = useMemo(() => {
        return props.appointments.filter((appointment) => {
            if (
                appointmentStatusFilter !== "ALL" &&
                appointment.status !== appointmentStatusFilter
            ) {
                return false;
            }

            if (
                appointmentDoctorFilter !== "ALL" &&
                appointment.doctorId !== appointmentDoctorFilter
            ) {
                return false;
            }

            if (
                appointmentDateFilter &&
                appointment.scheduledDate !== appointmentDateFilter
            ) {
                return false;
            }

            return true;
        });
    }, [
        appointmentDateFilter,
        appointmentDoctorFilter,
        appointmentStatusFilter,
        props.appointments,
    ]);

    function startEditingPatient(patientId: string): void {
        setEditingPatientId(patientId);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
                <button
                    type="button"
                    onClick={() => setActiveSection("PATIENTS")}
                    className={
                        activeSection === "PATIENTS"
                            ? "flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
                            : "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                    }
                >
                    <Users size={18} />
                    Pacientes
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection("APPOINTMENTS")}
                    className={
                        activeSection === "APPOINTMENTS"
                            ? "flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
                            : "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                    }
                >
                    <CalendarClock size={18} />
                    Citas
                </button>
            </div>

            {activeSection === "PATIENTS" && (
                <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
                    <div>
                        {editingPatient ? (
                            <div className="rounded-2xl border border-cyan-500/30 bg-slate-900 p-6 shadow-xl shadow-cyan-950/20">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                                            Paciente seleccionado
                                        </p>

                                        <h2 className="mt-2 text-xl font-semibold">
                                            Editar paciente
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Modifica únicamente información
                                            administrativa.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingPatientId(null)
                                        }
                                        className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                                        aria-label="Cerrar edición"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <ActionMessage
                                    state={updatePatientState}
                                    className="mt-4"
                                />

                                <form
                                    key={editingPatient.id}
                                    action={updatePatientFormAction}
                                    className="mt-5 flex flex-col gap-4"
                                >
                                    <input
                                        type="hidden"
                                        name="patientId"
                                        value={editingPatient.id}
                                    />

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Nombre completo
                                        </span>

                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            minLength={2}
                                            maxLength={120}
                                            defaultValue={editingPatient.name}
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Email
                                        </span>

                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            defaultValue={editingPatient.email}
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Teléfono
                                        </span>

                                        <input
                                            name="phone"
                                            type="tel"
                                            required
                                            minLength={7}
                                            maxLength={30}
                                            defaultValue={
                                                editingPatient.phone ?? ""
                                            }
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Fecha de nacimiento
                                        </span>

                                        <input
                                            name="birthDate"
                                            type="date"
                                            required
                                            defaultValue={
                                                editingPatient.birthDate ?? ""
                                            }
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Sexo
                                        </span>

                                        <select
                                            name="sex"
                                            required
                                            defaultValue={
                                                editingPatient.sex ??
                                                "UNSPECIFIED"
                                            }
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        >
                                            {Object.entries(
                                                patientSexLabels
                                            ).map(([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Dirección
                                        </span>

                                        <textarea
                                            name="address"
                                            maxLength={250}
                                            rows={3}
                                            defaultValue={
                                                editingPatient.address ?? ""
                                            }
                                            className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            type="submit"
                                            disabled={updatePatientPending}
                                            className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {updatePatientPending
                                                ? "Guardando..."
                                                : "Guardar cambios"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingPatientId(null)
                                            }
                                            className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
                                        >
                                            Cancelar edición
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
                                        <UserPlus size={22} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Registrar paciente
                                        </h2>

                                        <p className="text-sm text-slate-400">
                                            Crea su cuenta y perfil
                                            administrativo.
                                        </p>
                                    </div>
                                </div>

                                <ActionMessage
                                    state={createPatientState}
                                    className="mb-4"
                                />

                                <form
                                    action={createPatientFormAction}
                                    className="flex flex-col gap-4"
                                >
                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Nombre completo
                                        </span>

                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            minLength={2}
                                            maxLength={120}
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                            placeholder="Nombre del paciente"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Email
                                        </span>

                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                            placeholder="paciente@correo.com"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Contraseña temporal
                                        </span>

                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            minLength={8}
                                            maxLength={100}
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                            placeholder="Mínimo 8 caracteres"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Teléfono
                                        </span>

                                        <input
                                            name="phone"
                                            type="tel"
                                            required
                                            minLength={7}
                                            maxLength={30}
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                            placeholder="Número de contacto"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Fecha de nacimiento
                                        </span>

                                        <input
                                            name="birthDate"
                                            type="date"
                                            required
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Sexo
                                        </span>

                                        <select
                                            name="sex"
                                            required
                                            defaultValue="UNSPECIFIED"
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        >
                                            {Object.entries(
                                                patientSexLabels
                                            ).map(([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Dirección
                                        </span>

                                        <textarea
                                            name="address"
                                            maxLength={250}
                                            rows={3}
                                            className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                            placeholder="Dirección opcional"
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={createPatientPending}
                                        className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {createPatientPending
                                            ? "Registrando..."
                                            : "Registrar paciente"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                        <div className="flex flex-col gap-4 border-b border-slate-800 p-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Pacientes registrados
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Mostrando {filteredPatients.length} de{" "}
                                    {props.patients.length}
                                </p>
                            </div>

                            <label className="relative block w-full md:max-w-sm">
                                <Search
                                    size={18}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    type="search"
                                    value={patientSearch}
                                    onChange={(event) =>
                                        setPatientSearch(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                                    placeholder="Buscar por nombre, email o teléfono"
                                />
                            </label>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[940px] text-left text-sm">
                                <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400">
                                    <tr>
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
                                        <th className="px-6 py-4">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800">
                                    {filteredPatients.map((patient) => (
                                        <tr
                                            key={patient.id}
                                            className={
                                                editingPatientId === patient.id
                                                    ? "bg-cyan-500/5 text-slate-300"
                                                    : "text-slate-300"
                                            }
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-100">
                                                    {patient.name}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Registrado{" "}
                                                    {formatDateTime(
                                                        patient.createdAt
                                                    )}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p>{patient.email}</p>

                                                <p className="mt-1 text-slate-500">
                                                    {patient.phone ??
                                                        "Sin teléfono"}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                {formatDate(
                                                    patient.birthDate
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {getPatientSexLabel(
                                                    patient.sex
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={
                                                        patient.isActive
                                                            ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                                                            : "rounded-full bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-300"
                                                    }
                                                >
                                                    {patient.isActive
                                                        ? "Activo"
                                                        : "Inactivo"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        startEditingPatient(
                                                            patient.id
                                                        )
                                                    }
                                                    className={
                                                        editingPatientId ===
                                                            patient.id
                                                            ? "flex items-center gap-2 rounded-lg border border-cyan-400 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200"
                                                            : "flex items-center gap-2 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
                                                    }
                                                >
                                                    <Pencil size={14} />
                                                    {editingPatientId ===
                                                        patient.id
                                                        ? "Editando"
                                                        : "Editar"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredPatients.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-12 text-center text-slate-400"
                                            >
                                                No se encontraron pacientes.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === "APPOINTMENTS" && (
                <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
                    <div className="flex flex-col gap-6">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
                                    <CalendarPlus size={22} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Agendar cita
                                    </h2>

                                    <p className="text-sm text-slate-400">
                                        Requiere al menos 8 horas de
                                        anticipación.
                                    </p>
                                </div>
                            </div>

                            {props.doctors.length === 0 && (
                                <div className="mb-4 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                                    <CircleAlert
                                        size={20}
                                        className="shrink-0"
                                    />

                                    <p>
                                        No hay doctores activos disponibles.
                                    </p>
                                </div>
                            )}

                            <ActionMessage
                                state={createAppointmentState}
                                className="mb-4"
                            />

                            <form
                                action={createAppointmentFormAction}
                                className="flex flex-col gap-4"
                            >
                                <label className="flex flex-col gap-2 text-sm">
                                    <span className="font-medium text-slate-300">
                                        Paciente
                                    </span>

                                    <select
                                        name="patientId"
                                        required
                                        defaultValue=""
                                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                    >
                                        <option value="" disabled>
                                            Selecciona un paciente
                                        </option>

                                        {props.patients
                                            .filter(
                                                (patient) =>
                                                    patient.isActive
                                            )
                                            .map((patient) => (
                                                <option
                                                    key={patient.id}
                                                    value={patient.id}
                                                >
                                                    {patient.name} ·{" "}
                                                    {patient.email}
                                                </option>
                                            ))}
                                    </select>
                                </label>

                                <label className="flex flex-col gap-2 text-sm">
                                    <span className="font-medium text-slate-300">
                                        Doctor
                                    </span>

                                    <select
                                        name="doctorId"
                                        required
                                        defaultValue=""
                                        disabled={
                                            props.doctors.length === 0
                                        }
                                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="" disabled>
                                            Selecciona un doctor
                                        </option>

                                        {props.doctors.map((doctor) => (
                                            <option
                                                key={doctor.id}
                                                value={doctor.id}
                                            >
                                                {doctor.name}
                                                {doctor.specialty
                                                    ? ` · ${doctor.specialty}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Fecha
                                        </span>

                                        <input
                                            name="scheduledDate"
                                            type="date"
                                            required
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Hora
                                        </span>

                                        <input
                                            name="startTime"
                                            type="time"
                                            required
                                            step={1800}
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>
                                </div>

                                <label className="flex flex-col gap-2 text-sm">
                                    <span className="font-medium text-slate-300">
                                        Duración
                                    </span>

                                    <select
                                        name="durationMinutes"
                                        required
                                        defaultValue="30"
                                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                    >
                                        <option value="30">
                                            30 minutos
                                        </option>
                                        <option value="60">
                                            60 minutos
                                        </option>
                                    </select>
                                </label>

                                <label className="flex flex-col gap-2 text-sm">
                                    <span className="font-medium text-slate-300">
                                        Motivo de consulta
                                    </span>

                                    <textarea
                                        name="reason"
                                        required
                                        minLength={3}
                                        maxLength={500}
                                        rows={4}
                                        className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        placeholder="Motivo administrativo de la cita"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={
                                        createAppointmentPending ||
                                        props.doctors.length === 0 ||
                                        props.patients.length === 0
                                    }
                                    className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {createAppointmentPending
                                        ? "Agendando..."
                                        : "Agendar cita"}
                                </button>
                            </form>
                        </div>

                        {reschedulingAppointment && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Reagendar cita
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {
                                                reschedulingAppointment.patientName
                                            }
                                            {" · "}
                                            {
                                                reschedulingAppointment.doctorName
                                            }
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setReschedulingAppointmentId(
                                                null
                                            )
                                        }
                                        className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                                        aria-label="Cerrar reagendado"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <ActionMessage
                                    state={rescheduleAppointmentState}
                                    className="mt-4"
                                />

                                <form
                                    action={
                                        rescheduleAppointmentFormAction
                                    }
                                    className="mt-5 flex flex-col gap-4"
                                >
                                    <input
                                        type="hidden"
                                        name="appointmentId"
                                        value={
                                            reschedulingAppointment.id
                                        }
                                    />

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Nueva fecha
                                        </span>

                                        <input
                                            name="scheduledDate"
                                            type="date"
                                            required
                                            defaultValue={
                                                reschedulingAppointment.scheduledDate
                                            }
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Nueva hora
                                        </span>

                                        <input
                                            name="startTime"
                                            type="time"
                                            required
                                            step={1800}
                                            defaultValue={
                                                reschedulingAppointment.startTime
                                            }
                                            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={
                                            rescheduleAppointmentPending
                                        }
                                        className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {rescheduleAppointmentPending
                                            ? "Reagendando..."
                                            : "Confirmar reagendado"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setReschedulingAppointmentId(
                                                null
                                            )
                                        }
                                        className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
                                    >
                                        Cancelar
                                    </button>
                                </form>
                            </div>
                        )}

                        {cancellingAppointment && (
                            <div className="rounded-2xl border border-red-500/30 bg-slate-900 p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-red-200">
                                            Cancelar cita
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {
                                                cancellingAppointment.patientName
                                            }
                                            {" · "}
                                            {formatDate(
                                                cancellingAppointment.scheduledDate
                                            )}
                                            {" · "}
                                            {
                                                cancellingAppointment.startTime
                                            }
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCancellingAppointmentId(
                                                null
                                            )
                                        }
                                        className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
                                        aria-label="Cerrar cancelación"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <ActionMessage
                                    state={cancelAppointmentState}
                                    className="mt-4"
                                />

                                <form
                                    action={cancelAppointmentFormAction}
                                    className="mt-5 flex flex-col gap-4"
                                >
                                    <input
                                        type="hidden"
                                        name="appointmentId"
                                        value={
                                            cancellingAppointment.id
                                        }
                                    />

                                    <label className="flex flex-col gap-2 text-sm">
                                        <span className="font-medium text-slate-300">
                                            Motivo de cancelación
                                        </span>

                                        <textarea
                                            name="reason"
                                            maxLength={500}
                                            rows={4}
                                            className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-red-400"
                                            placeholder="Motivo opcional"
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={
                                            cancelAppointmentPending
                                        }
                                        className="rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {cancelAppointmentPending
                                            ? "Cancelando..."
                                            : "Confirmar cancelación"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCancellingAppointmentId(
                                                null
                                            )
                                        }
                                        className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
                                    >
                                        Conservar cita
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                        <div className="border-b border-slate-800 p-6">
                            <h2 className="text-xl font-semibold">
                                Agenda de citas
                            </h2>

                            <p className="text-sm text-slate-400">
                                Mostrando {filteredAppointments.length} de{" "}
                                {props.appointments.length}
                            </p>

                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                <label className="flex flex-col gap-2 text-sm">
                                    <span className="font-medium text-slate-400">
                                        Fecha
                                    </span>

                                    <input
                                        type="date"
                                        value={appointmentDateFilter}
                                        onChange={(event) =>
                                            setAppointmentDateFilter(
                                                event.target.value
                                            )
                                        }
                                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-sm">
                                    <span className="font-medium text-slate-400">
                                        Doctor
                                    </span>

                                    <select
                                        value={appointmentDoctorFilter}
                                        onChange={(event) =>
                                            setAppointmentDoctorFilter(
                                                event.target.value
                                            )
                                        }
                                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                    >
                                        <option value="ALL">Todos</option>

                                        {props.doctors.map((doctor) => (
                                            <option
                                                key={doctor.id}
                                                value={doctor.id}
                                            >
                                                {doctor.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="flex flex-col gap-2 text-sm">
                                    <span className="font-medium text-slate-400">
                                        Estado
                                    </span>

                                    <select
                                        value={appointmentStatusFilter}
                                        onChange={(event) =>
                                            setAppointmentStatusFilter(
                                                event.target
                                                    .value as
                                                | AppointmentStatus
                                                | "ALL"
                                            )
                                        }
                                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                                    >
                                        <option value="ALL">Todos</option>
                                        <option value="SCHEDULED">
                                            Programadas
                                        </option>
                                        <option value="COMPLETED">
                                            Completadas
                                        </option>
                                        <option value="CANCELLED">
                                            Canceladas
                                        </option>
                                    </select>
                                </label>
                            </div>

                            {(appointmentDateFilter ||
                                appointmentDoctorFilter !== "ALL" ||
                                appointmentStatusFilter !== "ALL") && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAppointmentDateFilter("");
                                            setAppointmentDoctorFilter("ALL");
                                            setAppointmentStatusFilter("ALL");
                                        }}
                                        className="mt-4 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1120px] text-left text-sm">
                                <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">
                                            Fecha y hora
                                        </th>
                                        <th className="px-6 py-4">
                                            Paciente
                                        </th>
                                        <th className="px-6 py-4">
                                            Doctor
                                        </th>
                                        <th className="px-6 py-4">
                                            Motivo
                                        </th>
                                        <th className="px-6 py-4">
                                            Estado
                                        </th>
                                        <th className="px-6 py-4">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800">
                                    {filteredAppointments.map(
                                        (appointment) => {
                                            const canModify =
                                                appointment.status ===
                                                "SCHEDULED";

                                            return (
                                                <tr
                                                    key={appointment.id}
                                                    className="text-slate-300"
                                                >
                                                    <td className="px-6 py-4">
                                                        <p className="font-medium text-slate-100">
                                                            {formatDate(
                                                                appointment.scheduledDate
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-slate-400">
                                                            {
                                                                appointment.startTime
                                                            }
                                                            {" - "}
                                                            {
                                                                appointment.endTime
                                                            }
                                                            {" · "}
                                                            {
                                                                appointment.durationMinutes
                                                            }{" "}
                                                            min
                                                        </p>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <p className="font-medium text-slate-100">
                                                            {
                                                                appointment.patientName
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {
                                                                appointment.patientEmail
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <p>
                                                            {
                                                                appointment.doctorName
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {appointment.specialty ??
                                                                "Sin especialidad registrada"}
                                                        </p>
                                                    </td>

                                                    <td className="max-w-[260px] px-6 py-4">
                                                        <p className="line-clamp-3">
                                                            {appointment.reason ??
                                                                "Sin motivo registrado"}
                                                        </p>

                                                        {appointment.status ===
                                                            "CANCELLED" &&
                                                            appointment.cancellationReason && (
                                                                <p className="mt-2 text-xs text-red-300">
                                                                    Cancelación:{" "}
                                                                    {
                                                                        appointment.cancellationReason
                                                                    }
                                                                </p>
                                                            )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                                appointment.status
                                                            )}`}
                                                        >
                                                            {
                                                                appointmentStatusLabels[
                                                                appointment
                                                                    .status
                                                                ]
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {canModify ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setCancellingAppointmentId(
                                                                            null
                                                                        );
                                                                        setReschedulingAppointmentId(
                                                                            appointment.id
                                                                        );
                                                                    }}
                                                                    className="rounded-lg border border-cyan-500/40 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
                                                                >
                                                                    Reagendar
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setReschedulingAppointmentId(
                                                                            null
                                                                        );
                                                                        setCancellingAppointmentId(
                                                                            appointment.id
                                                                        );
                                                                    }}
                                                                    className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-500">
                                                                Sin acciones
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}

                                    {filteredAppointments.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-12 text-center text-slate-400"
                                            >
                                                No hay citas que coincidan con
                                                los filtros.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}