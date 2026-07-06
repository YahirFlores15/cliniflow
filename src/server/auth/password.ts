import bcrypt from "bcryptjs";


const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(params: {
    password: string;
    passwordHash: string;
}): Promise<boolean> {
    return bcrypt.compare(params.password, params.passwordHash);
}