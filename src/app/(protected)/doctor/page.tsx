import { DoctorAgendaFilterSchema, } from "@/shared/schemas/doctor.schemas";
import { getDoctorAgenda } from "@/server/modules/doctor/doctor.service";
import DoctorPanel from "@/app/(protected)/doctor/doctor-panel";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";


type DoctorPageProps = {
    searchParams: Promise<{
        date?: string;
        status?: string;
    }>;
};

export default async function DoctorPage({
    searchParams,
}: DoctorPageProps) {
    const session = await requireRole([
        ROLES.DOCTOR,
    ]);

    const rawSearchParams = await searchParams;

    const parsedFilters =
        DoctorAgendaFilterSchema.safeParse({
            date: rawSearchParams.date,
            status: rawSearchParams.status,
        });

    const filters = parsedFilters.success
        ? parsedFilters.data
        : {};

    const agenda = getDoctorAgenda({
        userId: session.user.id,
        filters,
    });

    return (
        <DoctorPanel
            agenda={agenda}
            filters={filters}
        />
    );
}