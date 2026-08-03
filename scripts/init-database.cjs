const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

const Database = require("better-sqlite3");

const projectRoot = path.resolve(__dirname, "..");

const schemaPath = path.join(
    projectRoot,
    "db",
    "schema.sql"
);

const migrationsDirectory = path.join(
    projectRoot,
    "db",
    "migrations"
);

function resolveDatabasePath() {
    const configuredPath =
        process.env.DATABASE_PATH?.trim();

    if (!configuredPath) {
        return path.join(
            projectRoot,
            "db",
            "cliniflow.sqlite"
        );
    }

    if (
        path.isAbsolute(
            configuredPath
        )
    ) {
        return configuredPath;
    }

    return path.resolve(
        projectRoot,
        configuredPath
    );
}

const databasePath =
    resolveDatabasePath();

function calculateChecksum(
    content
) {
    return crypto
        .createHash("sha256")
        .update(
            content,
            "utf8"
        )
        .digest("hex");
}

function ensureRequiredFilesExist() {
    if (
        !fs.existsSync(
            schemaPath
        )
    ) {
        throw new Error(
            `No se encontró el esquema SQL en: ${schemaPath}`
        );
    }

    if (
        !fs.existsSync(
            migrationsDirectory
        )
    ) {
        fs.mkdirSync(
            migrationsDirectory,
            {
                recursive: true,
            }
        );
    }
}

function ensureDatabaseDirectoryExists() {
    const databaseDirectory =
        path.dirname(
            databasePath
        );

    fs.mkdirSync(
        databaseDirectory,
        {
            recursive: true,
        }
    );
}

function assertDatabaseDoesNotExist() {
    if (
        fs.existsSync(
            databasePath
        )
    ) {
        throw new Error(
            [
                "La base de datos ya existe.",
                `Ruta: ${databasePath}`,
                "El inicializador no sobrescribe archivos existentes.",
                "Elimina manualmente la base únicamente si realmente deseas reconstruirla.",
            ].join(" ")
        );
    }
}

function getMigrationFiles() {
    return fs
        .readdirSync(
            migrationsDirectory
        )
        .filter(
            (fileName) =>
                fileName.endsWith(
                    ".sql"
                )
        )
        .sort(
            (
                firstFile,
                secondFile
            ) =>
                firstFile.localeCompare(
                    secondFile
                )
        );
}

function registerIncludedMigrations(
    database,
    migrationFiles
) {
    if (
        migrationFiles.length ===
        0
    ) {
        return 0;
    }

    const insertMigration =
        database.prepare(
            `
            INSERT INTO schema_migrations (
                name,
                checksum
            )
            VALUES (?, ?)
            `
        );

    let registeredCount =
        0;

    for (
        const migrationName
        of migrationFiles
    ) {
        const migrationPath =
            path.join(
                migrationsDirectory,
                migrationName
            );

        const migrationSql =
            fs.readFileSync(
                migrationPath,
                "utf8"
            );

        const checksum =
            calculateChecksum(
                migrationSql
            );

        insertMigration.run(
            migrationName,
            checksum
        );

        registeredCount +=
            1;
    }

    return registeredCount;
}

function initializeDatabase() {
    ensureRequiredFilesExist();
    ensureDatabaseDirectoryExists();
    assertDatabaseDoesNotExist();

    const schemaSql =
        fs.readFileSync(
            schemaPath,
            "utf8"
        );

    const migrationFiles =
        getMigrationFiles();

    const database =
        new Database(
            databasePath
        );

    try {
        database.pragma(
            "foreign_keys = ON"
        );

        database.pragma(
            "busy_timeout = 5000"
        );

        const transaction =
            database.transaction(
                () => {
                    database.exec(
                        schemaSql
                    );

                    return registerIncludedMigrations(
                        database,
                        migrationFiles
                    );
                }
            );

        const registeredMigrations =
            transaction();

        const integrityResult =
            database
                .pragma(
                    "integrity_check",
                    {
                        simple: true,
                    }
                );

        if (
            integrityResult !==
            "ok"
        ) {
            throw new Error(
                `SQLite reportó un problema de integridad: ${integrityResult}`
            );
        }

        console.log("");
        console.log(
            "Base de datos inicializada correctamente."
        );
        console.log(
            `Ruta: ${databasePath}`
        );
        console.log(
            `Migraciones registradas: ${registeredMigrations}`
        );
        console.log(
            "Integridad SQLite: ok"
        );
    } catch (
    error
    ) {
        database.close();

        if (
            fs.existsSync(
                databasePath
            )
        ) {
            fs.rmSync(
                databasePath,
                {
                    force: true,
                }
            );
        }

        throw error;
    }

    database.close();
}

try {
    initializeDatabase();
} catch (
error
) {
    console.error("");
    console.error(
        "No se pudo inicializar la base de datos."
    );

    if (
        error instanceof
        Error
    ) {
        console.error(
            error.message
        );
    } else {
        console.error(
            error
        );
    }

    process.exitCode =
        1;
}