import type { DoctorAppointmentStatus, } from "@/shared/schemas/doctor.schemas";


export type DoctorProfileDTO = {
    id: string;
    userId: string;
    name: string;
    email: string;
    specialty: string | null;
    licenseNumber: string | null;
    defaultAppointmentDurationMinutes: 30 | 60;
    isActive: boolean;
};

export type DoctorAppointmentDTO = {
    id: string;
    patientId: string;
    patientUserId: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string | null;
    patientBirthDate: string | null;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: 30 | 60;
    status: DoctorAppointmentStatus;
    reason: string | null;
    cancellationReason: string | null;
    createdAt: string;
    updatedAt: string;
    hasMedicalNote: boolean;
};

export type DoctorScheduleDTO = {
    id: string;
    doctorId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    appointmentDurationMinutes: 30 | 60;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type DoctorAgendaSummaryDTO = {
    todayScheduled: number;
    upcomingScheduled: number;
    completed: number;
    cancelled: number;
};

export type DoctorAgendaDTO = {
    doctor: DoctorProfileDTO;
    appointments: DoctorAppointmentDTO[];
    schedules: DoctorScheduleDTO[];
    summary: DoctorAgendaSummaryDTO;
};

export type UpsertDoctorScheduleRepositoryInput = {
    doctorId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    appointmentDurationMinutes: 30 | 60;
    isActive: boolean;
};