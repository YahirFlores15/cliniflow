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

export type DoctorBlockDTO = {
    id: string;
    doctorId: string;
    startDateTime: string;
    endDateTime: string;
    reason: string | null;
    createdAt: string;
};

export type MedicalRecordDTO = {
    id: string | null;
    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string | null;
    patientBirthDate: string | null;
    allergies: string | null;
    chronicDiseases: string | null;
    currentMedications: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    createdAt: string | null;
    updatedAt: string | null;
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
    blocks: DoctorBlockDTO[];
    medicalRecords: MedicalRecordDTO[];
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

export type CreateDoctorBlockRepositoryInput = {
    doctorId: string;
    startDateTime: string;
    endDateTime: string;
    reason: string;
};

export type CancelAppointmentsForDoctorBlockRepositoryInput = {
    appointmentIds: string[];
    cancelledByUserId: string;
    cancellationReason: string;
};

export type UpsertMedicalRecordRepositoryInput = {
    patientId: string;
    allergies: string;
    chronicDiseases: string;
    currentMedications: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
};