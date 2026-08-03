import { synchronizePastAppointments, } from "@/server/modules/appointments/appointment-status.service";
import { AppShell, } from "@/components/layout/app-shell";
import { requireSession, } from "@/server/auth/session";
import type { ReactNode, } from "react";


type ProtectedLayoutProps = {
    children:
    ReactNode;
};

export default async function ProtectedLayout({
    children,
}: ProtectedLayoutProps) {
    const session =
        await requireSession();

    synchronizePastAppointments();

    return (
        <AppShell
            user={{
                name:
                    session.user.name,
                email:
                    session.user.email,
                role:
                    session.user.role,
            }}
        >
            {children}
        </AppShell>
    );
}