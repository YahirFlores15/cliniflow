import { createSession, findSessionById, revokeSession, } from "@/server/modules/sessions/sessions.repository";
import { findUserByEmail, findUserById } from "@/server/modules/users/users.repository";
import type { CurrentSessionDTO } from "@/shared/dtos/auth.dtos";
import { ROLE_HOME_PATHS } from "@/shared/constants/roles";
import { verifyPassword } from "@/server/auth/password";
import type { Role } from "@/shared/constants/roles";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";


const SESSION_COOKIE_NAME = "cliniflow_session";
const SESSION_DAYS = 7;

function getSessionExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
    return expiresAt;
}

export async function loginWithEmailAndPassword(params: {
    email: string;
    password: string;
}): Promise<CurrentSessionDTO> {
    const user = findUserByEmail(params.email);

    if (!user) {
        throw new Error("Credenciales inválidas.");
    }

    if (!user.isActive) {
        throw new Error("El usuario está desactivado.");
    }

    const passwordIsValid = await verifyPassword({
        password: params.password,
        passwordHash: user.passwordHash,
    });

    if (!passwordIsValid) {
        throw new Error("Credenciales inválidas.");
    }

    const expiresAt = getSessionExpirationDate();

    const session = createSession({
        userId: user.id,
        expiresAt,
    });

    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, session.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiresAt,
    });

    return {
        sessionId: session.id,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        },
    };
}

export async function getCurrentSession(): Promise<CurrentSessionDTO | null> {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
        return null;
    }

    const session = findSessionById(sessionId);

    if (!session) {
        return null;
    }

    if (session.revokedAt) {
        return null;
    }

    if (new Date(session.expiresAt) <= new Date()) {
        return null;
    }

    const user = findUserById(session.userId);

    if (!user) {
        return null;
    }

    if (!user.isActive) {
        return null;
    }

    return {
        sessionId: session.id,
        user,
    };
}

export async function logout(): Promise<void> {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionId) {
        revokeSession(sessionId);
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireSession(): Promise<CurrentSessionDTO> {
    const session = await getCurrentSession();

    if (!session) {
        redirect("/login");
    }

    return session;
}

export async function requireRole(allowedRoles: Role[]): Promise<CurrentSessionDTO> {
    const session = await requireSession();

    if (!allowedRoles.includes(session.user.role)) {
        redirect("/access-denied");
    }

    return session;
}

export function getHomePathForRole(role: Role): string {
    return ROLE_HOME_PATHS[role];
}