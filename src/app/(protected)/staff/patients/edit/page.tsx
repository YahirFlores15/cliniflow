import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { ArrowLeft, Info, ShieldCheck, UserRoundCog, } from "lucide-react";
import { PatientForm } from "@/app/(protected)/staff/patients/patient-form";
import { findPatientById } from "@/server/modules/staff/staff.repository";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";


type EditStaffPatientPageProps = {
    searchParams: Promise<{
        patientId?: string;
    }>;
};

export default async function EditStaffPatientPage({
    searchParams,
}: EditStaffPatientPageProps) {
    await requireRole([ROLES.STAFF]);

    const resolvedSearchParams =
        await searchParams;

    const patientId =
        resolvedSearchParams.patientId?.trim();

    if (!patientId) {
        notFound();
    }

    const patient =
        findPatientById(patientId);

    if (!patient) {
        notFound();
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <Link
                        href="/staff/patients"
                        className={cn(
                            buttonVariants({
                                variant: "ghost",
                                size: "sm",
                            }),
                            "-ml-3 mb-3"
                        )}
                    >
                        <ArrowLeft className="size-4" />
                        Volver a pacientes
                    </Link>

                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Recepción
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Editar paciente
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Actualiza los datos personales y de contacto permitidos para recepción.
                    </p>
                </div>

                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                    <UserRoundCog
                        className="size-6"
                        strokeWidth={1.9}
                    />
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Información administrativa
                        </CardTitle>

                        <CardDescription>
                            Los cambios se reflejarán en recepción y en el portal del paciente.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <PatientForm
                            mode="edit"
                            patient={patient}
                        />
                    </CardContent>
                </Card>

                <aside className="space-y-4">
                    <Card>
                        <CardContent>
                            <div className="flex size-10 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                <ShieldCheck
                                    className="size-5"
                                    strokeWidth={1.9}
                                />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-foreground">
                                Estado de acceso
                            </h3>

                            <div className="mt-3">
                                <Badge
                                    variant={
                                        patient.isActive
                                            ? "success"
                                            : "danger"
                                    }
                                >
                                    {patient.isActive
                                        ? "Paciente activo"
                                        : "Paciente inactivo"}
                                </Badge>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-foreground-muted">
                                La edición de datos no modifica el estado de acceso de la cuenta.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex size-10 items-center justify-center rounded-xl border border-warning-border bg-warning-soft text-warning-hover">
                                <Info
                                    className="size-5"
                                    strokeWidth={1.9}
                                />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-foreground">
                                Información clínica protegida
                            </h3>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                Esta pantalla no permite consultar ni modificar expediente, diagnósticos, recetas o notas médicas.
                            </p>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}