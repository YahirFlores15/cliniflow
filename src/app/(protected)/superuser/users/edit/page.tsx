import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { ArrowLeft, Info, ShieldCheck, UserRoundCog, } from "lucide-react";
import { EditUserForm } from "@/app/(protected)/superuser/users/edit/edit-user-form";
import { findAdminUserById } from "@/server/modules/superuser/superuser.repository";
import { buttonVariants, } from "@/components/ui/button";
import { ROLE_LABELS } from "@/shared/constants/roles";
import { requireRole } from "@/server/auth/session";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";


type EditSuperuserUserPageProps = {
    searchParams: Promise<{
        userId?: string;
    }>;
};

export default async function EditSuperuserUserPage({
    searchParams,
}: EditSuperuserUserPageProps) {
    await requireRole(["SUPERUSER"]);

    const resolvedSearchParams =
        await searchParams;

    const userId =
        resolvedSearchParams.userId?.trim();

    if (!userId) {
        notFound();
    }

    const user = findAdminUserById(userId);

    if (!user) {
        notFound();
    }

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
                        Edición administrativa
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Editar usuario
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Modifica el nombre o correo electrónico de la cuenta seleccionada.
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
                            Información de la cuenta
                        </CardTitle>

                        <CardDescription>
                            Los cambios se aplicarán al próximo acceso y a las vistas administrativas.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <EditUserForm user={user} />
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
                                Rol asignado
                            </h3>

                            <div className="mt-3">
                                <Badge variant="primary">
                                    {ROLE_LABELS[user.role]}
                                </Badge>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-foreground-muted">
                                El rol no puede modificarse desde esta pantalla porque puede tener perfiles y datos relacionados.
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
                                Estado de acceso
                            </h3>

                            <div className="mt-3">
                                <Badge
                                    variant={
                                        user.isActive
                                            ? "success"
                                            : "danger"
                                    }
                                >
                                    {user.isActive
                                        ? "Usuario activo"
                                        : "Usuario inactivo"}
                                </Badge>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-foreground-muted">
                                La activación y desactivación se administra desde el listado de usuarios.
                            </p>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}