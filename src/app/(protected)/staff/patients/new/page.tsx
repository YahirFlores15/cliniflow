import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { ArrowLeft, Info, ShieldCheck, UserPlus, } from "lucide-react";
import { PatientForm } from "@/app/(protected)/staff/patients/patient-form";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/shared/constants/roles";
import { cn } from "@/lib/utils";
import Link from "next/link";


export default async function NewStaffPatientPage() {
    await requireRole([ROLES.STAFF]);

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
                        Registrar paciente
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Crea la cuenta de acceso y registra los datos administrativos necesarios para gestionar sus citas.
                    </p>
                </div>

                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                    <UserPlus
                        className="size-6"
                        strokeWidth={1.9}
                    />
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Información del paciente
                        </CardTitle>

                        <CardDescription>
                            Completa los datos personales, de contacto y acceso al portal.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <PatientForm mode="create" />
                    </CardContent>
                </Card>

                <aside className="space-y-4">
                    <Card>
                        <CardContent>
                            <div className="flex size-10 items-center justify-center rounded-xl border border-secondary-border bg-secondary-soft text-secondary">
                                <ShieldCheck
                                    className="size-5"
                                    strokeWidth={1.9}
                                />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-foreground">
                                Cuenta automática
                            </h3>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                Al registrar al paciente se crean conjuntamente su usuario y perfil administrativo.
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
                                Sin datos clínicos
                            </h3>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                Recepción solo administra datos personales y de contacto. El expediente clínico pertenece al módulo médico.
                            </p>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}