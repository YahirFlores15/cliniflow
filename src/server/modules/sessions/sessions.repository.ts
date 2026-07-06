import type { SessionDTO } from "@/shared/dtos/auth.dtos";
import { getDb } from "@/server/db/connection";
import { nanoid } from "nanoid";


const db = getDb();


type SessionRow = {
    id: string;
    user_id: string;
    expires_at: string;
    created_at: string;
    revoked_at: string | null;
};

function mapSessionRow(row: SessionRow): SessionDTO {
    return {
        id: row.id,
        userId: row.user_id,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        revokedAt: row.revoked_at,
    };
}

export function createSession(params: {
    userId: string;
    expiresAt: Date;
}): SessionDTO {
    const id = nanoid(48);

    db.prepare(
        `
    INSERT INTO sessions (
      id,
      user_id,
      expires_at
    )
    VALUES (?, ?, ?)
    `
    ).run(
        id,
        params.userId,
        params.expiresAt.toISOString()
    );

    const session = findSessionById(id);

    if (!session) {
        throw new Error("No se pudo crear la sesión.");
    }

    return session;
}

export function findSessionById(sessionId: string): SessionDTO | null {
    const row = db
        .prepare(
            `
      SELECT id, user_id, expires_at, created_at, revoked_at
      FROM sessions
      WHERE id = ?
      LIMIT 1
      `
        )
        .get(sessionId) as SessionRow | undefined;

    return row ? mapSessionRow(row) : null;
}

export function revokeSession(sessionId: string): void {
    db.prepare(
        `
    UPDATE sessions
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `
    ).run(sessionId);
}

export function deleteExpiredSessions(): void {
    db.prepare(
        `
    DELETE FROM sessions
    WHERE expires_at <= ?
       OR revoked_at IS NOT NULL
    `
    ).run(new Date().toISOString());
}