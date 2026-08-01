export type DoctorRelatedPatientDTO = {
    patientId: string;
    patientUserId: string;

    name: string;
    email: string;
    phone: string | null;
    birthDate: string | null;

    appointmentCount: number;
    medicalNoteCount: number;

    lastAppointmentDateTime:
    | string
    | null;

    nextAppointmentDateTime:
    | string
    | null;

    hasMedicalRecord: boolean;
};

export type DoctorPatientRecordDTO = {
    id: string | null;

    patientId: string;
    patientUserId: string;

    patientName: string;
    patientEmail: string;
    patientPhone: string | null;
    patientBirthDate: string | null;

    allergies: string | null;
    chronicDiseases: string | null;
    currentMedications: string | null;

    emergencyContactName:
    | string
    | null;

    emergencyContactPhone:
    | string
    | null;

    createdAt: string | null;
    updatedAt: string | null;

    appointmentCount: number;
    medicalNoteCount: number;

    lastAppointmentDateTime:
    | string
    | null;

    nextAppointmentDateTime:
    | string
    | null;
};

export type UpdateDoctorPatientRecordRepositoryInput = {
    patientId: string;

    allergies: string;
    chronicDiseases: string;
    currentMedications: string;

    emergencyContactName: string;
    emergencyContactPhone: string;
};