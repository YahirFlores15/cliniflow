CREATE TABLE medical_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL UNIQUE,
    allergies TEXT,
    chronic_diseases TEXT,
    current_medications TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES patient_profiles(id)
        ON DELETE CASCADE
);

CREATE TABLE medical_notes (
    id TEXT PRIMARY KEY,
    appointment_id TEXT NOT NULL UNIQUE,
    doctor_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT,
    prescription_text TEXT,
    instructions_text TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE RESTRICT,

    FOREIGN KEY (doctor_id)
        REFERENCES doctor_profiles(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_medical_records_patient_id
    ON medical_records(patient_id);

CREATE INDEX idx_medical_notes_appointment_id
    ON medical_notes(appointment_id);

CREATE INDEX idx_medical_notes_doctor_id
    ON medical_notes(doctor_id);

CREATE INDEX idx_medical_notes_created_at
    ON medical_notes(created_at);