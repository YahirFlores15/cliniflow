import type { AppointmentStatus, } from "@/shared/schemas/staff.schemas";


export type CalendarView =
    | "WEEK"
    | "MONTH";

export type CalendarAppointment = {
    id: string;
    title: string;
    subtitle: string;

    doctorId: string;
    doctorName: string;
    doctorSpecialty: string | null;

    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone?: string | null;
    patientBirthDate?: string | null;

    scheduledDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: 30 | 60;

    status: AppointmentStatus;
    reason: string | null;
    cancellationReason: string | null;

    hasMedicalNote?: boolean;
};

export type CalendarDoctorOption = {
    id: string;
    name: string;
    specialty: string | null;
};

export type CalendarDoctorSchedule = {
    id: string;
    doctorId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    appointmentDurationMinutes:
    | 30
    | 60;
    isActive: boolean;
};

export type CalendarDoctorBlock = {
    id: string;
    doctorId: string;
    startDateTime: string;
    endDateTime: string;
    reason: string | null;
};

export type CalendarSlotSelection = {
    doctorId: string;
    scheduledDate: string;
    startTime: string;
};

export type CalendarDay = {
    date: Date;
    dateKey: string;
    dayNumber: number;
    isToday: boolean;
    isCurrentMonth: boolean;
};