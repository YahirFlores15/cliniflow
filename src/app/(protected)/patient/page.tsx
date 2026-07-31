import { getPatientPortal } from "@/server/modules/patient/patient.service";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";

import PatientPanel from "./patient-panel";


export default async function PatientPage() {
    const session = await requireRole([ROLES.PATIENT]);

    const portal = getPatientPortal(session.user.id);

    return <PatientPanel portal={portal} />;
}