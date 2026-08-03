const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

const projectRoot = path.resolve(__dirname, "..");

const sourceDatabasePath = path.join(
    projectRoot,
    "db",
    "cliniflow.sqlite"
);

function resolveTargetDatabasePath() {
    const configuredPath = process.env.DATABASE_PATH?.trim();

    if (!configuredPath) {
        return sourceDatabasePath;
    }

    if (path.isAbsolute(configuredPath)) {
        return configuredPath;
    }

    return path.resolve(projectRoot, configuredPath);
}

function ensureDirectoryExists(filePath) {
    const directoryPath = path.dirname(filePath);

    fs.mkdirSync(directoryPath, {
        recursive: true,
    });
}

function prepareProductionDatabase() {
    const targetDatabasePath = resolveTargetDatabasePath();

    console.log("");
    console.log("Preparando base de datos de ClinicFlow...");
    console.log(`Base de origen: ${sourceDatabasePath}`);
    console.log(`Base de ejecución: ${targetDatabasePath}`);

    ensureDirectoryExists(targetDatabasePath);

    if (fs.existsSync(targetDatabasePath)) {
        console.log(
            "La base persistente ya existe. No será reemplazada."
        );
        return;
    }

    if (!fs.existsSync(sourceDatabasePath)) {
        throw new Error(
            [
                "No existe una base SQLite inicial para copiar.",
                `Ruta esperada: ${sourceDatabasePath}`,
                "Confirma que db/cliniflow.sqlite está incluido en Git.",
            ].join(" ")
        );
    }

    fs.copyFileSync(
        sourceDatabasePath,
        targetDatabasePath
    );

    console.log(
        "Base SQLite inicial copiada al almacenamiento persistente."
    );
}

try {
    prepareProductionDatabase();
} catch (error) {
    console.error("");
    console.error(
        "No se pudo preparar la base de datos de producción."
    );

    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(error);
    }

    process.exitCode = 1;
}