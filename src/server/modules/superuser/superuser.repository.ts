import type { AdminUserDTO } from "@/shared/dtos/auth.dtos";
import type { Role } from "@/shared/constants/roles";
import { getDb } from "@/server/db/connection";
import { nanoid } from "nanoid";


const db = getDb();

type AdminUserRow = {
    id: string;
    name: string;
    email: string;
    role: Role;
    is_active: number;
    created_at: string;
    updated_at: string;
};

function mapAdminUserRow(row: AdminUserRow): AdminUserDTO {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        isActive: row.is_active === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function listAdminUsers(): AdminUserDTO[] {
    const rows = db
        .prepare(
            `
            SELECT id, name, email, role, is_active, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
            `
        )
        .all() as AdminUserRow[];

    return rows.map(mapAdminUserRow);
}

export function findAdminUserById(userId: string): AdminUserDTO | null {
    const row = db
        .prepare(
            `
            SELECT id, name, email, role, is_active, created_at, updated_at
            FROM users
            WHERE id = ?
            LIMIT 1
            `
        )
        .get(userId) as AdminUserRow | undefined;

    return row ? mapAdminUserRow(row) : null;
}

export function emailExists(email: string): boolean {
    const row = db
        .prepare(
            `
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
            `
        )
        .get(email) as { id: string } | undefined;

    return Boolean(row);
}

export function emailExistsForAnotherUser(params: {
    email: string;
    userId: string;
}): boolean {
    const row = db
        .prepare(
            `
            SELECT id
            FROM users
            WHERE email = ?
              AND id != ?
            LIMIT 1
            `
        )
        .get(params.email, params.userId) as { id: string } | undefined;

    return Boolean(row);
}

export function createUserWithProfile(params: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
}): AdminUserDTO {
    const createTransaction = db.transaction(() => {
        const userId = nanoid();

        db.prepare(
            `
            INSERT INTO users (
                id,
                name,
                email,
                password_hash,
                role,
                is_active
            )
            VALUES (?, ?, ?, ?, ?, 1)
            `
        ).run(
            userId,
            params.name,
            params.email,
            params.passwordHash,
            params.role
        );

        if (params.role === "DOCTOR") {
            db.prepare(
                `
                INSERT INTO doctor_profiles (
                    id,
                    user_id,
                    default_appointment_duration_minutes
                )
                VALUES (?, ?, 30)
                `
            ).run(nanoid(), userId);
        }

        if (params.role === "STAFF") {
            db.prepare(
                `
                INSERT INTO staff_profiles (
                    id,
                    user_id
                )
                VALUES (?, ?)
                `
            ).run(nanoid(), userId);
        }

        if (params.role === "PATIENT") {
            db.prepare(
                `
                INSERT INTO patient_profiles (
                    id,
                    user_id
                )
                VALUES (?, ?)
                `
            ).run(nanoid(), userId);
        }

        const user = findAdminUserById(userId);

        if (!user) {
            throw new Error("No se pudo crear el usuario.");
        }

        return user;
    });

    return createTransaction();
}

export function updateAdminUser(params: {
    userId: string;
    name: string;
    email: string;
}): void {
    db.prepare(
        `
        UPDATE users
        SET name = ?,
            email = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `
    ).run(params.name, params.email, params.userId);
}

export function setUserActiveStatus(params: {
    userId: string;
    isActive: boolean;
}): void {
    db.prepare(
        `
        UPDATE users
        SET is_active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `
    ).run(params.isActive ? 1 : 0, params.userId);
}