import type { DoctorAgendaDTO, DoctorAgendaSummaryDTO, DoctorAppointmentDTO, } from "@/shared/dtos/doctor.dtos";
import { findDoctorProfileByUserId, listAppointmentsForDoctor, } from "@/server/modules/doctor/doctor.repository";
import type { DoctorAgendaFilterInput, } from "@/shared/schemas/doctor.schemas";


export class DoctorDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DoctorDomainError";
    }
}

function getLocalCalendarDate(
    date = new Date()
): string {
    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function buildAgendaSummary(params: {
    appointments: DoctorAppointmentDTO[];
    today: string;
}): DoctorAgendaSummaryDTO {
    let todayScheduled = 0;
    let upcomingScheduled = 0;
    let completed = 0;
    let cancelled = 0;

    for (const appointment of params.appointments) {
        if (appointment.status === "COMPLETED") {
            completed += 1;
            continue;
        }

        if (appointment.status === "CANCELLED") {
            cancelled += 1;
            continue;
        }

        if (appointment.scheduledDate === params.today) {
            todayScheduled += 1;
        }

        if (appointment.scheduledDate > params.today) {
            upcomingScheduled += 1;
        }
    }

    return {
        todayScheduled,
        upcomingScheduled,
        completed,
        cancelled,
    };
}

export function getDoctorAgenda(params: {
    userId: string;
    filters?: DoctorAgendaFilterInput;
}): DoctorAgendaDTO {
    const doctor = findDoctorProfileByUserId(
        params.userId
    );

    if (!doctor) {
        throw new DoctorDomainError(
            "No se encontró el perfil médico de la cuenta autenticada."
        );
    }

    if (!doctor.isActive) {
        throw new DoctorDomainError(
            "La cuenta médica se encuentra desactivada."
        );
    }

    const allAppointments = listAppointmentsForDoctor({
        doctorId: doctor.id,
    });

    const appointments = listAppointmentsForDoctor({
        doctorId: doctor.id,
        scheduledDate: params.filters?.date,
        status: params.filters?.status,
    });

    const summary = buildAgendaSummary({
        appointments: allAppointments,
        today: getLocalCalendarDate(),
    });

    return {
        doctor,
        appointments,
        summary,
    };
}