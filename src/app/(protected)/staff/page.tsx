import { getStaffAppointments, getStaffDoctors, getStaffPatients, } from "@/server/modules/staff/staff.service";
import { StaffPanel } from "@/app/(protected)/staff/staff-panel";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";


export default async function StaffPage() {
    await requireRole([ROLES.STAFF]);

    const patients = getStaffPatients();
    const doctors = getStaffDoctors();
    const appointments = getStaffAppointments();

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
            <div className="mx-auto flex max-w-7xl flex-col gap-8">
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
                            ClinicFlow
                        </p>

                        <h1 className="text-3xl font-bold">
                            Panel de recepción
                        </h1>

                        <p className="max-w-3xl text-sm text-slate-400">
                            Registro administrativo de pacientes y gestión de
                            citas. Este panel no muestra expedientes, notas
                            médicas ni información clínica.
                        </p>
                    </div>
                </section>

                <StaffPanel
                    patients={patients}
                    doctors={doctors}
                    appointments={appointments}
                />
            </div>
        </main>
    );
}