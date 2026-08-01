import { listActiveDoctors, listDoctorBlocks, listDoctorSchedules, } from "@/server/modules/staff/staff.repository";
import type { DoctorBlockDTO, DoctorOptionDTO, DoctorScheduleDTO, } from "@/shared/dtos/staff.dtos";


export type StaffCalendarAvailability = {
    doctors: DoctorOptionDTO[];
    schedules: DoctorScheduleDTO[];
    blocks: DoctorBlockDTO[];
};

export function getStaffCalendarAvailability(): StaffCalendarAvailability {
    const doctors =
        listActiveDoctors();

    const schedules =
        doctors.flatMap(
            (doctor) =>
                listDoctorSchedules(
                    doctor.id
                ).filter(
                    (schedule) =>
                        schedule.isActive
                )
        );

    const blocks =
        doctors.flatMap(
            (doctor) =>
                listDoctorBlocks({
                    doctorId:
                        doctor.id,
                })
        );

    return {
        doctors,
        schedules,
        blocks,
    };
}