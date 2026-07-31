import type { AppointmentStatus, PatientSex, } from "@/shared/schemas/staff.schemas";


export type PatientDTO = {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string | null;
    birthDate: string | null;
    sex: PatientSex | null;
    address: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type DoctorOptionDTO = {
    id: string;
    userId: string;
    name: string;
    email: string;
    specialty: string | null;
    licenseNumber: string | null;
    defaultAppointmentDurationMinutes: 30 | 60;
    isActive: boolean;
};

export type DoctorScheduleDTO = {
    id: string;
    doctorId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    appointmentDurationMinutes: 30 | 60;
    isActive: boolean;
};

export type DoctorBlockDTO = {
    id: string;
    doctorId: string;
    startDateTime: string;
    endDateTime: string;
    reason: string | null;
};

export type AppointmentDTO = {
    id: string;
    patientId: string;
    patientUserId: string;
    patientName: string;
    patientEmail: string;
    doctorId: string;
    doctorUserId: string;
    doctorName: string;
    specialty: string | null;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: 30 | 60;
    status: AppointmentStatus;
    reason: string | null;
    cancellationReason: string | null;
    cancelledAt: string | null;
    cancelledByUserId: string | null;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;
};

export type AppointmentAvailabilityDTO = {
    isAvailable: boolean;
    reason:
    | "AVAILABLE"
    | "DOCTOR_NOT_FOUND"
    | "DOCTOR_INACTIVE"
    | "NO_SCHEDULE"
    | "OUTSIDE_SCHEDULE"
    | "BLOCKED"
    | "OVERLAP";
};

export type CreatePatientRepositoryInput = {
    name: string;
    email: string;
    passwordHash: string;
    phone: string;
    birthDate: string;
    sex: PatientSex;
    address: string;
};

export type UpdatePatientRepositoryInput = {
    patientId: string;
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    sex: PatientSex;
    address: string;
};

export type CreateAppointmentRepositoryInput = {
    patientId: string;
    doctorId: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: 30 | 60;
    reason: string;
    createdByUserId: string;
};

export type RescheduleAppointmentRepositoryInput = {
    appointmentId: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
};

export type CancelAppointmentRepositoryInput = {
    appointmentId: string;
    cancellationReason: string;
    cancelledByUserId: string;
};