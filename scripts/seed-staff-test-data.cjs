const Database = require("better-sqlite3");
const { randomUUID } = require("node:crypto");
const path = require("node:path");

const databasePath = path.join(
    process.cwd(),
    "db",
    "cliniflow.sqlite"
);

const database = new Database(databasePath);

database.pragma("foreign_keys = ON");

const doctorsToConfigure = [
    {
        email: "carlos@utem.com",
        specialty: "Medicina general",
        licenseNumber: "CLINIFLOW-CARLOS-001",
        defaultAppointmentDurationMinutes: 30,
        schedule: {
            startTime: "08:00",
            endTime: "14:00",
            appointmentDurationMinutes: 30,
        },
    },
    {
        email: "a20230088@utem.edu.mx",
        specialty: "Medicina interna",
        licenseNumber: "CLINIFLOW-YAHIR-001",
        defaultAppointmentDurationMinutes: 60,
        schedule: {
            startTime: "14:00",
            endTime: "20:00",
            appointmentDurationMinutes: 60,
        },
    },
];

function findDoctorByEmail(email) {
    return database
        .prepare(`
            SELECT
                u.id AS user_id,
                u.name,
                u.email,
                u.is_active,
                dp.id AS doctor_profile_id
            FROM users u
            INNER JOIN doctor_profiles dp
                ON dp.user_id = u.id
            WHERE
                u.role = 'DOCTOR'
                AND LOWER(u.email) = LOWER(?)
            LIMIT 1
        `)
        .get(email);
}

function updateDoctorProfile(params) {
    database
        .prepare(`
            UPDATE doctor_profiles
            SET
                specialty = ?,
                license_number = ?,
                default_appointment_duration_minutes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `)
        .run(
            params.specialty,
            params.licenseNumber,
            params.defaultAppointmentDurationMinutes,
            params.doctorProfileId
        );
}

function upsertDoctorSchedule(params) {
    const existingSchedule = database
        .prepare(`
            SELECT id
            FROM doctor_schedules
            WHERE
                doctor_id = ?
                AND weekday = ?
            LIMIT 1
        `)
        .get(params.doctorProfileId, params.weekday);

    if (existingSchedule) {
        database
            .prepare(`
                UPDATE doctor_schedules
                SET
                    start_time = ?,
                    end_time = ?,
                    appointment_duration_minutes = ?,
                    is_active = 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                params.startTime,
                params.endTime,
                params.appointmentDurationMinutes,
                existingSchedule.id
            );

        return;
    }

    database
        .prepare(`
            INSERT INTO doctor_schedules (
                id,
                doctor_id,
                weekday,
                start_time,
                end_time,
                appointment_duration_minutes,
                is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `)
        .run(
            randomUUID(),
            params.doctorProfileId,
            params.weekday,
            params.startTime,
            params.endTime,
            params.appointmentDurationMinutes
        );
}

function getNextWeekdayDate(targetWeekday) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentWeekday = today.getDay() === 0
        ? 7
        : today.getDay();

    let daysUntilTarget = targetWeekday - currentWeekday;

    if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
    }

    const result = new Date(today);
    result.setDate(today.getDate() + daysUntilTarget);

    const year = result.getFullYear();
    const month = String(result.getMonth() + 1).padStart(2, "0");
    const day = String(result.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function createOrReplaceTestBlock(doctorProfileId) {
    const blockedDate = getNextWeekdayDate(3);
    const startDatetime = `${blockedDate} 10:00`;
    const endDatetime = `${blockedDate} 11:00`;
    const reason = "Bloqueo de prueba para validar disponibilidad";

    database
        .prepare(`
            DELETE FROM doctor_blocks
            WHERE
                doctor_id = ?
                AND reason = ?
        `)
        .run(doctorProfileId, reason);

    database
        .prepare(`
            INSERT INTO doctor_blocks (
                id,
                doctor_id,
                start_datetime,
                end_datetime,
                reason
            )
            VALUES (?, ?, ?, ?, ?)
        `)
        .run(
            randomUUID(),
            doctorProfileId,
            startDatetime,
            endDatetime,
            reason
        );

    return {
        blockedDate,
        startDatetime,
        endDatetime,
    };
}

const seedTransaction = database.transaction(() => {
    const configuredDoctors = [];

    for (const doctorConfiguration of doctorsToConfigure) {
        const doctor = findDoctorByEmail(
            doctorConfiguration.email
        );

        if (!doctor) {
            console.warn(
                `No se encontró un doctor con el email ${doctorConfiguration.email}.`
            );

            continue;
        }

        updateDoctorProfile({
            doctorProfileId: doctor.doctor_profile_id,
            specialty: doctorConfiguration.specialty,
            licenseNumber: doctorConfiguration.licenseNumber,
            defaultAppointmentDurationMinutes:
                doctorConfiguration.defaultAppointmentDurationMinutes,
        });

        for (let weekday = 1; weekday <= 5; weekday += 1) {
            upsertDoctorSchedule({
                doctorProfileId: doctor.doctor_profile_id,
                weekday,
                startTime:
                    doctorConfiguration.schedule.startTime,
                endTime:
                    doctorConfiguration.schedule.endTime,
                appointmentDurationMinutes:
                    doctorConfiguration.schedule
                        .appointmentDurationMinutes,
            });
        }

        configuredDoctors.push({
            ...doctor,
            specialty: doctorConfiguration.specialty,
            duration:
                doctorConfiguration.schedule
                    .appointmentDurationMinutes,
            startTime:
                doctorConfiguration.schedule.startTime,
            endTime:
                doctorConfiguration.schedule.endTime,
        });
    }

    const doctorForBlock = configuredDoctors.find(
        (doctor) => doctor.email === "carlos@utem.com"
    );

    let testBlock = null;

    if (doctorForBlock) {
        testBlock = createOrReplaceTestBlock(
            doctorForBlock.doctor_profile_id
        );
    }

    return {
        configuredDoctors,
        testBlock,
    };
});

try {
    const result = seedTransaction();

    console.log("");
    console.log("Datos de prueba de Staff configurados.");
    console.log("");

    if (result.configuredDoctors.length === 0) {
        console.log(
            "No se configuró ningún doctor. Revisa los emails del script."
        );
    }

    for (const doctor of result.configuredDoctors) {
        console.log(`Doctor: ${doctor.name}`);
        console.log(`Email: ${doctor.email}`);
        console.log(`Especialidad: ${doctor.specialty}`);
        console.log(
            `Horario: lunes a viernes, ${doctor.startTime} a ${doctor.endTime}`
        );
        console.log(
            `Duración por cita: ${doctor.duration} minutos`
        );
        console.log("");
    }

    if (result.testBlock) {
        console.log("Bloqueo de prueba:");
        console.log(
            `${result.testBlock.startDatetime} a ${result.testBlock.endDatetime}`
        );
        console.log("");
    }

    console.log(
        "Puedes ejecutar este script nuevamente sin duplicar horarios."
    );
} catch (error) {
    console.error("");
    console.error(
        "No fue posible configurar los datos de prueba de Staff."
    );
    console.error(error);

    process.exitCode = 1;
} finally {
    database.close();
}