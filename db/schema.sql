PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPERUSER', 'STAFF', 'DOCTOR', 'PATIENT')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  specialty TEXT,
  license_number TEXT,
  default_appointment_duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (default_appointment_duration_minutes IN (30, 60)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  position TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  phone TEXT,
  birth_date TEXT,
  sex TEXT CHECK (sex IS NULL OR sex IN ('MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED')),
  address TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_schedules (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  appointment_duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (appointment_duration_minutes IN (30, 60)),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  UNIQUE (doctor_id, weekday)
);

CREATE TABLE IF NOT EXISTS doctor_blocks (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  start_datetime TEXT NOT NULL,
  end_datetime TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60)),
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED')),
  reason TEXT,
  cancellation_reason TEXT,
  cancelled_at TEXT,
  cancelled_by_user_id TEXT,
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (patient_id) REFERENCES patient_profiles(id) ON DELETE RESTRICT,
  FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE RESTRICT,
  FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS medical_records (
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

CREATE TABLE IF NOT EXISTS medical_notes (
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

CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_role
  ON users(role);

CREATE INDEX IF NOT EXISTS idx_users_is_active
  ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
  ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id
  ON doctor_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_user_id
  ON staff_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id
  ON patient_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_id
  ON doctor_schedules(doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctor_schedules_weekday
  ON doctor_schedules(weekday);

CREATE INDEX IF NOT EXISTS idx_doctor_blocks_doctor_id
  ON doctor_blocks(doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctor_blocks_start_datetime
  ON doctor_blocks(start_datetime);

CREATE INDEX IF NOT EXISTS idx_doctor_blocks_end_datetime
  ON doctor_blocks(end_datetime);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id
  ON appointments(patient_id);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id
  ON appointments(doctor_id);

CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date
  ON appointments(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_time
  ON appointments(
    doctor_id,
    scheduled_date,
    start_time,
    end_time
  );

CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id
  ON medical_records(patient_id);

CREATE INDEX IF NOT EXISTS idx_medical_notes_appointment_id
  ON medical_notes(appointment_id);

CREATE INDEX IF NOT EXISTS idx_medical_notes_doctor_id
  ON medical_notes(doctor_id);

CREATE INDEX IF NOT EXISTS idx_medical_notes_created_at
  ON medical_notes(created_at);