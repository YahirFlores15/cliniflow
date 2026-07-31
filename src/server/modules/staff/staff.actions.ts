"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/server/auth/session";
import {
    cancelAppointmentForStaff,
    createAppointmentForStaff,
    createPatientForStaff,
    rescheduleAppointmentForStaff,
    StaffDomainError,
    updatePatientForStaff,
} from "@/server/modules/staff/staff.service";
import { ROLES } from "@/shared/constants/roles";
import {
    CancelAppointmentSchema,
    CreateAppointmentSchema,
    CreatePatientSchema,
    RescheduleAppointmentSchema,
    UpdatePatientSchema,
} from "@/shared/schemas/staff.schemas";

export type StaffActionState = {
    ok: boolean;
    message: string;
};

function getActionErrorState(error: unknown): StaffActionState {
    if (error instanceof StaffDomainError) {
        return {
            ok: false,
            message: error.message,
        };
    }

    console.error(error);

    return {
        ok: false,
        message:
            "Ocurrió un error inesperado. Intenta nuevamente.",
    };
}

export async function createPatientAction(
    _previousState: StaffActionState,
    formData: FormData
): Promise<StaffActionState> {
    await requireRole([ROLES.STAFF]);

    const rawData = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        birthDate: String(formData.get("birthDate") ?? ""),
        sex: String(formData.get("sex") ?? ""),
        address: String(formData.get("address") ?? ""),
    };

    const parsed = CreatePatientSchema.safeParse(rawData);

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "Los datos del paciente no son válidos.",
        };
    }

    try {
        await createPatientForStaff(parsed.data);

        revalidatePath("/staff");

        return {
            ok: true,
            message: "Paciente registrado correctamente.",
        };
    } catch (error) {
        return getActionErrorState(error);
    }
}

export async function updatePatientAction(
    _previousState: StaffActionState,
    formData: FormData
): Promise<StaffActionState> {
    await requireRole([ROLES.STAFF]);

    const rawData = {
        patientId: String(formData.get("patientId") ?? ""),
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        birthDate: String(formData.get("birthDate") ?? ""),
        sex: String(formData.get("sex") ?? ""),
        address: String(formData.get("address") ?? ""),
    };

    const parsed = UpdatePatientSchema.safeParse(rawData);

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "Los datos del paciente no son válidos.",
        };
    }

    try {
        updatePatientForStaff(parsed.data);

        revalidatePath("/staff");

        return {
            ok: true,
            message: "Paciente actualizado correctamente.",
        };
    } catch (error) {
        return getActionErrorState(error);
    }
}

export async function createAppointmentAction(
    _previousState: StaffActionState,
    formData: FormData
): Promise<StaffActionState> {
    const session = await requireRole([ROLES.STAFF]);

    const rawData = {
        patientId: String(formData.get("patientId") ?? ""),
        doctorId: String(formData.get("doctorId") ?? ""),
        scheduledDate: String(
            formData.get("scheduledDate") ?? ""
        ),
        startTime: String(formData.get("startTime") ?? ""),
        durationMinutes: String(
            formData.get("durationMinutes") ?? ""
        ),
        reason: String(formData.get("reason") ?? ""),
    };

    const parsed = CreateAppointmentSchema.safeParse(rawData);

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "Los datos de la cita no son válidos.",
        };
    }

    try {
        createAppointmentForStaff({
            input: parsed.data,
            createdByUserId: session.user.id,
        });

        revalidatePath("/staff");

        return {
            ok: true,
            message: "Cita agendada correctamente.",
        };
    } catch (error) {
        return getActionErrorState(error);
    }
}

export async function rescheduleAppointmentAction(
    _previousState: StaffActionState,
    formData: FormData
): Promise<StaffActionState> {
    await requireRole([ROLES.STAFF]);

    const rawData = {
        appointmentId: String(
            formData.get("appointmentId") ?? ""
        ),
        scheduledDate: String(
            formData.get("scheduledDate") ?? ""
        ),
        startTime: String(formData.get("startTime") ?? ""),
    };

    const parsed =
        RescheduleAppointmentSchema.safeParse(rawData);

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "Los datos para reagendar no son válidos.",
        };
    }

    try {
        rescheduleAppointmentForStaff(parsed.data);

        revalidatePath("/staff");

        return {
            ok: true,
            message: "Cita reagendada correctamente.",
        };
    } catch (error) {
        return getActionErrorState(error);
    }
}

export async function cancelAppointmentAction(
    _previousState: StaffActionState,
    formData: FormData
): Promise<StaffActionState> {
    const session = await requireRole([ROLES.STAFF]);

    const rawData = {
        appointmentId: String(
            formData.get("appointmentId") ?? ""
        ),
        reason: String(formData.get("reason") ?? ""),
    };

    const parsed = CancelAppointmentSchema.safeParse(rawData);

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error.issues[0]?.message ??
                "Los datos para cancelar no son válidos.",
        };
    }

    try {
        cancelAppointmentForStaff({
            input: parsed.data,
            cancelledByUserId: session.user.id,
        });

        revalidatePath("/staff");

        return {
            ok: true,
            message: "Cita cancelada correctamente.",
        };
    } catch (error) {
        return getActionErrorState(error);
    }
}