import { CalendarCheck2, FileHeart, ShieldCheck, } from "lucide-react";
import { getCurrentSession, getHomePathForRole } from "@/server/auth/session";
import { ClinicFlowPulse } from "@/components/brand/clinicflow-pulse";
import { ClinicFlowLogo } from "@/components/brand/clinicflow-logo";
import { redirect } from "next/navigation";

import { LoginForm } from "./login-form";


const LOGIN_FEATURES = [
    {
        icon: CalendarCheck2,
        title: "Agenda organizada",
        description:
            "Control de citas y disponibilidad desde un mismo sistema.",
    },
    {
        icon: FileHeart,
        title: "Información clínica protegida",
        description:
            "Acceso separado según las responsabilidades de cada usuario.",
    },
    {
        icon: ShieldCheck,
        title: "Acceso seguro",
        description:
            "Sesiones protegidas y permisos definidos por rol.",
    },
] as const;

export default async function LoginPage() {
    const session = await getCurrentSession();

    if (session) {
        redirect(getHomePathForRole(session.user.role));
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background">
            <div
                className="pointer-events-none absolute -left-32 -top-32 size-[28rem] rounded-full bg-primary-soft blur-3xl"
                aria-hidden="true"
            />

            <div
                className="pointer-events-none absolute -bottom-40 -right-32 size-[32rem] rounded-full bg-secondary-soft blur-3xl"
                aria-hidden="true"
            />

            <section className="relative mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
                <div className="hidden min-h-screen flex-col justify-between px-10 py-10 lg:flex xl:px-16 xl:py-12">
                    <ClinicFlowLogo />

                    <div className="animate-clinicflow-fade-in max-w-2xl">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                            Gestión clínica moderna
                        </p>

                        <h1 className="mt-5 text-5xl font-bold leading-[1.08] tracking-tight text-foreground xl:text-6xl">
                            La operación de la clínica, clara y bajo control.
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-8 text-foreground-muted xl:text-lg">
                            ClinicFlow conecta administración, recepción,
                            médicos y pacientes en una experiencia sencilla,
                            segura y organizada.
                        </p>

                        <ClinicFlowPulse className="mt-8 max-w-xl" />

                        <div className="mt-8 grid gap-4 xl:grid-cols-3">
                            {LOGIN_FEATURES.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.title}
                                        className="rounded-2xl border border-border bg-surface/80 p-4 shadow-[var(--shadow-sm)] backdrop-blur"
                                    >
                                        <div className="flex size-10 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                                            <Icon
                                                className="size-5"
                                                strokeWidth={1.9}
                                            />
                                        </div>

                                        <h2 className="mt-4 text-sm font-semibold text-foreground">
                                            {feature.title}
                                        </h2>

                                        <p className="mt-1.5 text-xs leading-5 text-foreground-muted">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <p className="text-xs text-foreground-muted">
                        ClinicFlow · Sistema de gestión para clínica privada
                    </p>
                </div>

                <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-16">
                    <div className="w-full max-w-md animate-clinicflow-fade-in">
                        <div className="mb-8 flex justify-center lg:hidden">
                            <ClinicFlowLogo />
                        </div>

                        <div className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-lg)] sm:p-8">
                            <div className="mb-7">
                                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
                                    <ShieldCheck
                                        className="size-6"
                                        strokeWidth={1.9}
                                    />
                                </div>

                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                                    Acceso seguro
                                </p>

                                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    Iniciar sesión
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-foreground-muted">
                                    Ingresa con el correo y la contraseña
                                    asignados a tu cuenta.
                                </p>
                            </div>

                            <LoginForm />
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-foreground-muted">
                            <ShieldCheck className="size-4 text-secondary" />

                            <span>
                                Tus credenciales se procesan de forma segura.
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}