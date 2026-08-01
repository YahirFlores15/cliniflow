import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { CreateUserForm } from "@/app/(protected)/superuser/users/new/create-user-form";
import { ArrowLeft, Info, ShieldCheck, UserPlus, } from "lucide-react";
import { buttonVariants, } from "@/components/ui/button";
import { requireRole } from "@/server/auth/session";
import { cn } from "@/lib/utils";
import Link from "next/link";


export default async function NewSuperuserUserPage() {
    await requireRole(["SUPERUSER"]);

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <Link
                        href="/superuser/users"
                        className={cn(
                            buttonVariants({
                                variant: "ghost",
                                size: "sm",
                            }),
                            "-ml-3 mb-3"
                        )}
                    >
                        <ArrowLeft className="size-4" />
                        Volver a usuarios
                    </Link>

                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Nueva cuenta
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Crear usuario
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Registra una cuenta y asigna el rol que determinará sus permisos dentro de ClinicFlow.
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
                            Información del usuario
                        </CardTitle>

                        <CardDescription>
                            Completa los datos de acceso y la función que tendrá dentro del sistema.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <CreateUserForm />
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
                                Creación segura
                            </h3>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                La contraseña se almacena utilizando hash seguro y nunca se guarda en texto plano.
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
                                Rol permanente
                            </h3>

                            <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                El rol inicial no se modifica desde la edición básica porque cada tipo de usuario puede tener un perfil asociado.
                            </p>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}