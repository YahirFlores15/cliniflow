import { getDoctorBlocksWorkspace, } from "@/server/modules/doctor/doctor-block.service";
import { DoctorBlocksPanel, } from "@/app/(protected)/doctor/blocks/doctor-blocks-panel";
import { Ban, CalendarX2, ShieldAlert, } from "lucide-react";
import { requireRole, } from "@/server/auth/session";
import { ROLES, } from "@/shared/constants/roles";
import { Badge, } from "@/components/ui/badge";


export default async function DoctorBlocksPage() {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const workspace =
        getDoctorBlocksWorkspace(
            session.user.id
        );

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-warning-border bg-warning-soft text-warning-hover">
                        <Ban
                            className="size-6"
                            strokeWidth={
                                1.9
                            }
                        />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Área médica
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Bloqueos de disponibilidad
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-muted">
                        Registra ausencias o periodos en los que no podrás atender consultas.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="warning">
                            {
                                workspace
                                    .blocks
                                    .length
                            }{" "}
                            bloqueos vigentes
                        </Badge>

                        <Badge variant="neutral">
                            {
                                workspace
                                    .doctor
                                    .name
                            }
                        </Badge>
                    </div>
                </div>

                <div className="max-w-sm rounded-2xl border border-warning-border bg-warning-soft p-4">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning-hover" />

                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Operación sensible
                            </p>

                            <p className="mt-1 text-xs leading-5 text-foreground-muted">
                                Crear un bloqueo puede cancelar automáticamente citas programadas dentro del periodo.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-primary-border bg-primary-soft p-5">
                <div className="flex items-start gap-3">
                    <CalendarX2 className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Revisión previa
                        </p>

                        <p className="mt-1 text-xs leading-5 text-foreground-muted">
                            Usa “Revisar afectación” antes de confirmar para conocer qué pacientes perderán su cita.
                        </p>
                    </div>
                </div>
            </section>

            <DoctorBlocksPanel
                blocks={
                    workspace.blocks
                }
            />
        </div>
    );
}