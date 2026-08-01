"use client";

import {
    CalendarDays,
    CalendarPlus,
    Clock3,
    FileText,
    LoaderCircle,
    Stethoscope,
    UserRound,
} from "lucide-react";
import {
    useActionState,
    useMemo,
    useState,
} from "react";

import { ActionMessage } from "@/components/feedback/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    createAppointmentAction,
    type StaffActionState,
} from "@/server/modules/staff/staff.actions";
import type {
    DoctorOptionDTO,
    PatientDTO,
} from "@/shared/dtos/staff.dtos";

type AppointmentFormProps = {
    patients: PatientDTO[];
    doctors: DoctorOptionDTO[];
    initialDoctorId: string;
    initialDate: string;
    initialTime: string;
};

const initialState: StaffActionState = {
    ok: false,
    message: "",
};

export function AppointmentForm({
    patients,
    doctors,
    initialDoctorId,
    initialDate,
    initialTime,
}: AppointmentFormProps) {
    const [
        selectedDoctorId,
        setSelectedDoctorId,
    ] = useState(initialDoctorId);

    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        createAppointmentAction,
        initialState
    );

    const selectedDoctor = useMemo(
        () =>
            doctors.find(
                (doctor) =>
                    doctor.id ===
                    selectedDoctorId
            ) ?? null,
        [
            doctors,
            selectedDoctorId,
        ]
    );

    const activePatients = useMemo(
        () =>
            patients.filter(
                (patient) =>
                    patient.isActive
            ),
        [patients]
    );

    const hasError =
        Boolean(state.message) &&
        !state.ok;

    const canSubmit =
        activePatients.length > 0 &&
        doctors.length > 0;

    return (
        <form
            action={formAction}
            className="space-y-6"
        >
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

            {!canSubmit ? (
                <ActionMessage variant="error">
                    {!doctors.length
                        ? "No existen médicos activos disponibles para agendar citas."
                        : "No existen pacientes activos disponibles para agendar citas."}
                </ActionMessage>
            ) : null}

            <section>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                        <UserRound
                            className="size-5"
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Paciente y médico
                        </h3>

                        <p className="mt-0.5 text-sm text-foreground-muted">
                            Selecciona las personas relacionadas con la consulta.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="appointment-patient"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Paciente
                        </label>

                        <Select
                            id="appointment-patient"
                            name="patientId"
                            required
                            defaultValue=""
                            disabled={
                                isPending ||
                                activePatients.length ===
                                0
                            }
                            hasError={hasError}
                        >
                            <option
                                value=""
                                disabled
                            >
                                Selecciona un paciente
                            </option>

                            {activePatients.map(
                                (patient) => (
                                    <option
                                        key={
                                            patient.id
                                        }
                                        value={
                                            patient.id
                                        }
                                    >
                                        {
                                            patient.name
                                        }
                                        {" · "}
                                        {
                                            patient.email
                                        }
                                    </option>
                                )
                            )}
                        </Select>
                    </div>

                    <div>
                        <label
                            htmlFor="appointment-doctor"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Médico
                        </label>

                        <Select
                            id="appointment-doctor"
                            name="doctorId"
                            required
                            value={
                                selectedDoctorId
                            }
                            disabled={
                                isPending ||
                                doctors.length === 0
                            }
                            hasError={hasError}
                            onChange={(event) =>
                                setSelectedDoctorId(
                                    event.target
                                        .value
                                )
                            }
                        >
                            <option
                                value=""
                                disabled
                            >
                                Selecciona un médico
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
                                        {doctor.specialty
                                            ? ` · ${doctor.specialty}`
                                            : ""}
                                    </option>
                                )
                            )}
                        </Select>

                        {selectedDoctor ? (
                            <div className="mt-3 rounded-xl border border-secondary-border bg-secondary-soft px-4 py-3">
                                <div className="flex items-start gap-3">
                                    <Stethoscope className="mt-0.5 size-4.5 shrink-0 text-secondary" />

                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {
                                                selectedDoctor.name
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-foreground-muted">
                                            {selectedDoctor.specialty ??
                                                "Sin especialidad registrada"}
                                            {" · Citas de "}
                                            {
                                                selectedDoctor.defaultAppointmentDurationMinutes
                                            }{" "}
                                            minutos
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            <div className="border-t border-border" />

            <section>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                        <CalendarDays
                            className="size-5"
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Fecha y horario
                        </h3>

                        <p className="mt-0.5 text-sm text-foreground-muted">
                            El servidor validará disponibilidad, horario y bloqueos del médico.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                    <div>
                        <label
                            htmlFor="appointment-date"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Fecha
                        </label>

                        <Input
                            id="appointment-date"
                            name="scheduledDate"
                            type="date"
                            required
                            defaultValue={
                                initialDate
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
                            htmlFor="appointment-time"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Hora
                        </label>

                        <Input
                            id="appointment-time"
                            name="startTime"
                            type="time"
                            required
                            step={1800}
                            defaultValue={
                                initialTime
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
                    </div>

                    <div>
                        <label
                            htmlFor="appointment-duration"
                            className="mb-2 block text-sm font-semibold text-foreground"
                        >
                            Duración
                        </label>

                        <Select
                            id="appointment-duration"
                            name="durationMinutes"
                            required
                            value={String(
                                selectedDoctor
                                    ?.defaultAppointmentDurationMinutes ??
                                30
                            )}
                            disabled
                        >
                            <option value="30">
                                30 minutos
                            </option>

                            <option value="60">
                                60 minutos
                            </option>
                        </Select>

                        <input
                            type="hidden"
                            name="durationMinutes"
                            value={String(
                                selectedDoctor
                                    ?.defaultAppointmentDurationMinutes ??
                                30
                            )}
                        />
                    </div>
                </div>

                <div className="mt-4 rounded-2xl border border-warning-border bg-warning-soft p-4">
                    <p className="text-sm font-semibold text-foreground">
                        Anticipación mínima
                    </p>

                    <p className="mt-1 text-xs leading-5 text-foreground-muted">
                        La cita debe comenzar al menos ocho horas después del momento actual.
                    </p>
                </div>
            </section>

            <div className="border-t border-border" />

            <section>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border border-warning-border bg-warning-soft text-warning-hover">
                        <FileText
                            className="size-5"
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Motivo de consulta
                        </h3>

                        <p className="mt-0.5 text-sm text-foreground-muted">
                            Describe brevemente la razón administrativa de la cita.
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <label
                        htmlFor="appointment-reason"
                        className="mb-2 block text-sm font-semibold text-foreground"
                    >
                        Motivo
                    </label>

                    <Textarea
                        id="appointment-reason"
                        name="reason"
                        required
                        minLength={3}
                        maxLength={500}
                        rows={5}
                        disabled={isPending}
                        hasError={hasError}
                        placeholder="Motivo de la consulta"
                    />
                </div>
            </section>

            <div className="flex justify-end border-t border-border pt-6">
                <Button
                    type="submit"
                    size="lg"
                    disabled={
                        isPending ||
                        !canSubmit ||
                        !selectedDoctor
                    }
                    className="w-full sm:w-auto sm:min-w-48"
                >
                    {isPending ? (
                        <>
                            <LoaderCircle className="size-4.5 animate-spin" />
                            Agendando cita...
                        </>
                    ) : (
                        <>
                            <CalendarPlus className="size-4.5" />
                            Agendar cita
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}