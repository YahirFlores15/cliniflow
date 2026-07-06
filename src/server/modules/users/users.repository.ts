import type { AuthUserDTO } from "@/shared/dtos/auth.dtos";
import type { Role } from "@/shared/constants/roles";
import { getDb } from "@/server/db/connection";
import { nanoid } from "nanoid";


const db = getDb();

type UserRow = {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    role: Role;
    is_active: number;
};

export type UserWithPasswordHash = AuthUserDTO & {
    passwordHash: string;
};

function mapUserRow(row: UserRow): UserWithPasswordHash {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        isActive: row.is_active === 1,
    };
}

export function findUserByEmail(email: string): UserWithPasswordHash | null {
    const row = db
        .prepare(
            `
      SELECT id, name, email, password_hash, role, is_active
      FROM users
      WHERE email = ?
      LIMIT 1
      `
        )
        .get(email) as UserRow | undefined;

    return row ? mapUserRow(row) : null;
}

export function findUserById(userId: string): AuthUserDTO | null {
    const row = db
        .prepare(
            `
      SELECT id, name, email, password_hash, role, is_active
      FROM users
      WHERE id = ?
      LIMIT 1
      `
        )
        .get(userId) as UserRow | undefined;

    if (!row) return null;

    const user = mapUserRow(row);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
    };
}

export function createUser(params: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
}): AuthUserDTO {
    const id = nanoid();

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
        id,
        params.name,
        params.email,
        params.passwordHash,
        params.role
    );

    const user = findUserById(id);

    if (!user) {
        throw new Error("No se pudo crear el usuario.");
    }

    return user;
}