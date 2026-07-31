const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const Database = require("better-sqlite3");

const projectRoot = path.resolve(__dirname, "..");
const databasePath = path.join(
    projectRoot,
    "db",
    "cliniflow.sqlite"
);
const migrationsDirectory = path.join(
    projectRoot,
    "db",
    "migrations"
);

function calculateChecksum(content) {
    return crypto
        .createHash("sha256")
        .update(content, "utf8")
        .digest("hex");
}

function ensureMigrationsDirectoryExists() {
    if (!fs.existsSync(migrationsDirectory)) {
        fs.mkdirSync(migrationsDirectory, {
            recursive: true,
        });
    }
}

function getMigrationFiles() {
    return fs
        .readdirSync(migrationsDirectory)
        .filter((fileName) => fileName.endsWith(".sql"))
        .sort((firstFile, secondFile) =>
            firstFile.localeCompare(secondFile)
        );
}

function ensureMigrationsTable(database) {
    database.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name TEXT PRIMARY KEY,
            checksum TEXT NOT NULL,
            applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

function getAppliedMigration(database, migrationName) {
    return database
        .prepare(
            `
            SELECT
                name,
                checksum,
                applied_at
            FROM schema_migrations
            WHERE name = ?
            LIMIT 1
            `
        )
        .get(migrationName);
}

function applyMigration(database, migrationName, sql, checksum) {
    const transaction = database.transaction(() => {
        database.exec(sql);

        database
            .prepare(
                `
                INSERT INTO schema_migrations (
                    name,
                    checksum
                )
                VALUES (?, ?)
                `
            )
            .run(migrationName, checksum);
    });

    transaction();
}

function runMigrations() {
    ensureMigrationsDirectoryExists();

    const database = new Database(databasePath);

    try {
        database.pragma("foreign_keys = ON");
        database.pragma("busy_timeout = 5000");

        ensureMigrationsTable(database);

        const migrationFiles = getMigrationFiles();

        if (migrationFiles.length === 0) {
            console.log("No hay migraciones pendientes.");
            return;
        }

        let appliedCount = 0;
        let skippedCount = 0;

        for (const migrationName of migrationFiles) {
            const migrationPath = path.join(
                migrationsDirectory,
                migrationName
            );

            const sql = fs.readFileSync(
                migrationPath,
                "utf8"
            );

            const checksum = calculateChecksum(sql);

            const appliedMigration = getAppliedMigration(
                database,
                migrationName
            );

            if (appliedMigration) {
                if (appliedMigration.checksum !== checksum) {
                    throw new Error(
                        [
                            `La migración "${migrationName}" ya fue aplicada,`,
                            "pero su contenido cambió.",
                            "No modifiques una migración aplicada.",
                            "Crea una migración nueva para cualquier ajuste.",
                        ].join(" ")
                    );
                }

                console.log(
                    `Omitida: ${migrationName} ya estaba aplicada.`
                );

                skippedCount += 1;
                continue;
            }

            applyMigration(
                database,
                migrationName,
                sql,
                checksum
            );

            console.log(`Aplicada: ${migrationName}`);

            appliedCount += 1;
        }

        console.log("");
        console.log(
            `Migraciones aplicadas: ${appliedCount}`
        );
        console.log(
            `Migraciones omitidas: ${skippedCount}`
        );
    } finally {
        database.close();
    }
}

try {
    runMigrations();
} catch (error) {
    console.error("");
    console.error("No se pudieron aplicar las migraciones.");

    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(error);
    }

    process.exitCode = 1;
}