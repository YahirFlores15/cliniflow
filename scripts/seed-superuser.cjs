const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const path = require("node:path");
const process = require("node:process");

const databasePath = path.join(process.cwd(), "db", "cliniflow.sqlite");

const SUPERUSER_EMAIL = "admin@cliniflow.local";
const SUPERUSER_PASSWORD = "Admin12345";
const SUPERUSER_NAME = "Administrador ClinicFlow";

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

const existingUser = db
    .prepare(
        `
    SELECT id
    FROM users
    WHERE email = ?
    LIMIT 1
    `
    )
    .get(SUPERUSER_EMAIL);

if (existingUser) {
    console.log("El SUPERUSER inicial ya existe.");
    console.log(`Email: ${SUPERUSER_EMAIL}`);
    process.exit(0);
}

const passwordHash = bcrypt.hashSync(SUPERUSER_PASSWORD, 12);
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
  VALUES (?, ?, ?, ?, 'SUPERUSER', 1)
  `
).run(userId, SUPERUSER_NAME, SUPERUSER_EMAIL, passwordHash);

console.log("SUPERUSER inicial creado correctamente.");
console.log(`Email: ${SUPERUSER_EMAIL}`);
console.log(`Password: ${SUPERUSER_PASSWORD}`);