import type { AppointmentStatus } from "@/shared/schemas/staff.schemas";


export type CalendarView = "WEEK" | "MONTH";

export type CalendarAppointment = {
    id: string;
    title: string;
    subtitle: string;
    doctorId: string;
    doctorName: string;
    patientName: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: 30 | 60;
    status: AppointmentStatus;
    reason: string | null;
};

export type CalendarDoctorOption = {
    id: string;
    name: string;
    specialty: string | null;
};

export type CalendarDay = {
    date: Date;
    dateKey: string;
    dayNumber: number;
    isToday: boolean;
    isCurrentMonth: boolean;
};