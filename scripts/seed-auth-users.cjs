const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const path = require("node:path");
const process = require("node:process");

const databasePath = path.join(process.cwd(), "db", "cliniflow.sqlite");

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

const users = [
    {
        name: "Staff ClinicFlow",
        email: "staff@cliniflow.local",
        password: "Staff12345",
        role: "STAFF",
    },
    {
        name: "Doctor ClinicFlow",
        email: "doctor@cliniflow.local",
        password: "Doctor12345",
        role: "DOCTOR",
    },
    {
        name: "Paciente ClinicFlow",
        email: "patient@cliniflow.local",
        password: "Patient12345",
        role: "PATIENT",
    },
];

const findUserByEmail = db.prepare(
    `
  SELECT id
  FROM users
  WHERE email = ?
  LIMIT 1
  `
);

const insertUser = db.prepare(
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
);

for (const user of users) {
    const existingUser = findUserByEmail.get(user.email);

    if (existingUser) {
        console.log(`Usuario existente: ${user.email}`);
        continue;
    }

    const passwordHash = bcrypt.hashSync(user.password, 12);

    insertUser.run(
        nanoid(),
        user.name,
        user.email,
        passwordHash,
        user.role
    );

    console.log(`Usuario creado: ${user.email}`);
}

console.log("");
console.log("Usuarios de prueba:");
console.log("STAFF   -> staff@cliniflow.local / Staff12345");
console.log("DOCTOR  -> doctor@cliniflow.local / Doctor12345");
console.log("PATIENT -> patient@cliniflow.local / Patient12345");