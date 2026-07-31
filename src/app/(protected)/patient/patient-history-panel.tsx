import { Activity, CalendarDays, ClipboardList, FileText, HeartPulse, Pill, Stethoscope, } from "lucide-react";
import type { PatientAppointmentDTO, PatientMedicalNoteDTO, PatientMedicalRecordDTO, } from "@/shared/dtos/patient.dtos";


type PatientHistoryPanelProps = {
    appointments: PatientAppointmentDTO[];
    medicalRecord: PatientMedicalRecordDTO;
    medicalNotes: PatientMedicalNoteDTO[];
};

function formatDate(date: string): string {
    const [year, month, day] = date.split("-").map(Number);

    if (!year || !month || !day) {
        return date;
    }

    return new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(year, month - 1, day));
}

function getStatusLabel(
    status: PatientAppointmentDTO["status"]
): string {
    switch (status) {
        case "SCHEDULED":
            return "Programada pendiente";

        case "COMPLETED":
            return "Completada";

        case "CANCELLED":
            return "Cancelada";
    }
}

function getStatusClassName(
    status: PatientAppointmentDTO["status"]
): string {
    switch (status) {
        case "SCHEDULED":
            return "bg-amber-50 text-amber-800";

        case "COMPLETED":
            return "bg-emerald-50 text-emerald-800";

        case "CANCELLED":
            return "bg-rose-50 text-rose-800";
    }
}

function ClinicalText({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: string | null;
    icon: typeof Activity;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
                <Icon
                    aria-hidden="true"
                    className="h-4 w-4 text-cyan-700"
                />

                <h4 className="text-sm font-semibold text-slate-900">
                    {title}
                </h4>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {value?.trim() || "Sin información registrada."}
            </p>
        </div>
    );
}

export default function PatientHistoryPanel({
    appointments,
    medicalRecord,
    medicalNotes,
}: PatientHistoryPanelProps) {
    return (
        <section className="space-y-8">
            <header>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                    Información clínica
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    Historial médico
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Esta información es de solo lectura y corresponde
                    exclusivamente a tu expediente y consultas.
                </p>
            </header>

            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <HeartPulse
                            aria-hidden="true"
                            className="h-6 w-6 text-cyan-700"
                        />
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-950">
                            Expediente clínico básico
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Información permanente registrada por tus
                            médicos.
                        </p>
                    </div>
                </div>

                {medicalRecord.id ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <ClinicalText
                            title="Alergias"
                            value={medicalRecord.allergies}
                            icon={Activity}
                        />

                        <ClinicalText
                            title="Enfermedades crónicas"
                            value={
                                medicalRecord.chronicDiseases
                            }
                            icon={ClipboardList}
                        />

                        <ClinicalText
                            title="Medicamentos actuales"
                            value={
                                medicalRecord.currentMedications
                            }
                            icon={Pill}
                        />

                        <ClinicalText
                            title="Contacto de emergencia"
                            value={
                                medicalRecord.emergencyContactName ||
                                    medicalRecord.emergencyContactPhone
                                    ? [
                                        medicalRecord.emergencyContactName,
                                        medicalRecord.emergencyContactPhone,
                                    ]
                                        .filter(Boolean)
                                        .join(" · ")
                                    : null
                            }
                            icon={HeartPulse}
                        />
                    </div>
                ) : (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                        <FileText
                            aria-hidden="true"
                            className="mx-auto h-9 w-9 text-slate-400"
                        />

                        <h4 className="mt-3 font-semibold text-slate-900">
                            Aún no hay expediente registrado
                        </h4>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            El expediente aparecerá cuando un médico
                            registre información clínica.
                        </p>
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-950">
                        Notas médicas
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Diagnósticos, tratamientos, recetas e
                        indicaciones de tus consultas.
                    </p>
                </div>

                {medicalNotes.length > 0 ? (
                    <div className="space-y-4">
                        {medicalNotes.map((note) => (
                            <MedicalNoteCard
                                key={note.id}
                                note={note}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <ClipboardList
                            aria-hidden="true"
                            className="mx-auto h-10 w-10 text-slate-400"
                        />

                        <h4 className="mt-4 font-semibold text-slate-900">
                            No hay notas médicas disponibles
                        </h4>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Las notas creadas por tus médicos
                            aparecerán aquí.
                        </p>
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-950">
                        Historial de citas
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Citas completadas, canceladas o que quedaron
                        pendientes de actualización automática.
                    </p>
                </div>

                {appointments.length > 0 ? (
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Fecha
                                        </th>
                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Médico
                                        </th>
                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Motivo
                                        </th>
                                        <th className="px-5 py-4 font-semibold text-slate-700">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {appointments.map(
                                        (appointment) => (
                                            <tr
                                                key={
                                                    appointment.id
                                                }
                                                className="align-top"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4">
                                                    <p className="font-medium text-slate-900">
                                                        {formatDate(
                                                            appointment.scheduledDate
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {
                                                            appointment.startTime
                                                        }{" "}
                                                        a{" "}
                                                        {
                                                            appointment.endTime
                                                        }
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-slate-900">
                                                        Dr.{" "}
                                                        {
                                                            appointment.doctorName
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {appointment.specialty ??
                                                            "Sin especialidad registrada"}
                                                    </p>
                                                </td>

                                                <td className="max-w-xs px-5 py-4 text-slate-600">
                                                    {appointment.reason ??
                                                        "Sin motivo registrado"}

                                                    {appointment.cancellationReason ? (
                                                        <p className="mt-2 text-xs text-rose-700">
                                                            Cancelación:{" "}
                                                            {
                                                                appointment.cancellationReason
                                                            }
                                                        </p>
                                                    ) : null}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(
                                                            appointment.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            appointment.status
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <CalendarDays
                            aria-hidden="true"
                            className="mx-auto h-10 w-10 text-slate-400"
                        />

                        <h4 className="mt-4 font-semibold text-slate-900">
                            No existe historial de citas
                        </h4>
                    </div>
                )}
            </section>
        </section>
    );
}

function MedicalNoteCard({
    note,
}: {
    note: PatientMedicalNoteDTO;
}) {
    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-violet-50 p-3">
                        <Stethoscope
                            aria-hidden="true"
                            className="h-6 w-6 text-violet-700"
                        />
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-950">
                            Consulta con Dr. {note.doctorName}
                        </h4>

                        <p className="mt-1 text-sm text-slate-500">
                            {note.doctorSpecialty ??
                                "Especialidad no registrada"}
                        </p>
                    </div>
                </div>

                <div className="text-sm sm:text-right">
                    <p className="font-medium text-slate-900">
                        {formatDate(note.scheduledDate)}
                    </p>

                    <p className="mt-1 text-slate-500">
                        {note.startTime} a {note.endTime}
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ClinicalText
                    title="Motivo de consulta"
                    value={note.consultationReason}
                    icon={ClipboardList}
                />

                <ClinicalText
                    title="Diagnóstico"
                    value={note.diagnosis}
                    icon={Activity}
                />

                <ClinicalText
                    title="Tratamiento"
                    value={note.treatment}
                    icon={HeartPulse}
                />

                <ClinicalText
                    title="Receta"
                    value={note.prescriptionText}
                    icon={Pill}
                />

                <div className="md:col-span-2">
                    <ClinicalText
                        title="Indicaciones"
                        value={note.instructionsText}
                        icon={FileText}
                    />
                </div>
            </div>
        </article>
    );
}