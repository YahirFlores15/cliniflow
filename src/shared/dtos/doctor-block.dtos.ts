import type { DoctorBlockDTO, DoctorProfileDTO, } from "@/shared/dtos/doctor.dtos";


export type DoctorBlockAffectedAppointmentDTO = {
    id: string;
    patientId: string;
    patientName: string;
    patientEmail: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: 30 | 60;
    reason: string | null;
};

export type DoctorBlockPreviewDTO = {
    startDateTime: string;
    endDateTime: string;
    affectedAppointments:
    DoctorBlockAffectedAppointmentDTO[];
    affectedAppointmentsCount: number;
};

export type DoctorBlocksWorkspaceDTO = {
    doctor: DoctorProfileDTO;
    blocks: DoctorBlockDTO[];
};