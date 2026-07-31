import type { PatientAppointmentStatus, PatientSex, } from "@/shared/schemas/patient.schemas";


export type PatientProfileDTO = {
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

export type PatientAppointmentDTO = {
    id: string;
    patientId: string;
    doctorId: string;
    doctorUserId: string;
    doctorName: string;
    doctorEmail: string;
    specialty: string | null;
    licenseNumber: string | null;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: 30 | 60;
    status: PatientAppointmentStatus;
    reason: string | null;
    cancellationReason: string | null;
    cancelledAt: string | null;
    createdAt: string;
    updatedAt: string;
    hasMedicalNote: boolean;
};

export type PatientMedicalRecordDTO = {
    id: string | null;
    patientId: string;
    allergies: string | null;
    chronicDiseases: string | null;
    currentMedications: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type PatientMedicalNoteDTO = {
    id: string;
    appointmentId: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string | null;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    consultationReason: string;
    diagnosis: string;
    treatment: string | null;
    prescriptionText: string | null;
    instructionsText: string | null;
    createdAt: string;
    updatedAt: string;
};

export type PatientPortalSummaryDTO = {
    upcomingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    medicalNotes: number;
};

export type PatientPortalDTO = {
    profile: PatientProfileDTO;
    appointments: PatientAppointmentDTO[];
    medicalRecord: PatientMedicalRecordDTO;
    medicalNotes: PatientMedicalNoteDTO[];
    summary: PatientPortalSummaryDTO;
};

export type PatientAppointmentAvailabilityReason =
    | "AVAILABLE"
    | "DOCTOR_NOT_FOUND"
    | "DOCTOR_INACTIVE"
    | "NO_SCHEDULE"
    | "OUTSIDE_SCHEDULE"
    | "BLOCKED"
    | "OVERLAP";

export type PatientAppointmentAvailabilityDTO = {
    isAvailable: boolean;
    reason: PatientAppointmentAvailabilityReason;
};

export type PatientDoctorScheduleDTO = {
    id: string;
    doctorId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    appointmentDurationMinutes: 30 | 60;
    isActive: boolean;
};

export type UpdatePatientProfileRepositoryInput = {
    patientId: string;
    phone: string;
    address: string;
};

export type CancelPatientAppointmentRepositoryInput = {
    appointmentId: string;
    patientId: string;
    cancellationReason: string;
    cancelledByUserId: string;
};

export type ReschedulePatientAppointmentRepositoryInput = {
    appointmentId: string;
    patientId: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
};