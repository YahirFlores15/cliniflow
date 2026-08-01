"use server";

import {
    revalidatePath,
} from "next/cache";

import {
    requireRole,
} from "@/server/auth/session";
import {
    createDoctorBlockFromWorkspace,
    deleteDoctorBlockFromWorkspace,
    previewDoctorBlock,
} from "@/server/modules/doctor/doctor-block.service";
import {
    DoctorDomainError,
} from "@/server/modules/doctor/doctor.service";
import {
    ROLES,
} from "@/shared/constants/roles";
import type {
    DoctorBlockPreviewDTO,
} from "@/shared/dtos/doctor-block.dtos";
import {
    CreateDoctorBlockSchema,
    DeleteDoctorBlockSchema,
} from "@/shared/schemas/doctor.schemas";

export type DoctorBlockActionState = {
    ok: boolean;
    message: string;
};

export type DoctorBlockPreviewActionState = {
    ok: boolean;
    message: string;
    preview:
    DoctorBlockPreviewDTO | null;
};

const unexpectedErrorMessage =
    "Ocurrió un error inesperado. Intenta nuevamente.";

function getErrorMessage(
    error: unknown
): string {
    if (
        error instanceof
        DoctorDomainError
    ) {
        return error.message;
    }

    console.error(
        error
    );

    return unexpectedErrorMessage;
}

function getCreateBlockRawData(
    formData: FormData
) {
    return {
        startDate:
            String(
                formData.get(
                    "startDate"
                ) ?? ""
            ),
        startTime:
            String(
                formData.get(
                    "startTime"
                ) ?? ""
            ),
        endDate:
            String(
                formData.get(
                    "endDate"
                ) ?? ""
            ),
        endTime:
            String(
                formData.get(
                    "endTime"
                ) ?? ""
            ),
        reason:
            String(
                formData.get(
                    "reason"
                ) ?? ""
            ),
    };
}

export async function previewDoctorBlockAction(
    _previousState:
        DoctorBlockPreviewActionState,
    formData: FormData
): Promise<DoctorBlockPreviewActionState> {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const parsed =
        CreateDoctorBlockSchema.safeParse(
            getCreateBlockRawData(
                formData
            )
        );

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error
                    .issues[0]
                    ?.message ??
                "Los datos del bloqueo no son válidos.",
            preview:
                null,
        };
    }

    try {
        const preview =
            previewDoctorBlock({
                userId:
                    session.user.id,
                input:
                    parsed.data,
            });

        return {
            ok: true,
            message:
                preview
                    .affectedAppointmentsCount >
                    0
                    ? `El bloqueo afectará ${preview.affectedAppointmentsCount} citas programadas.`
                    : "El bloqueo no afectará citas programadas.",
            preview,
        };
    } catch (error) {
        return {
            ok: false,
            message:
                getErrorMessage(
                    error
                ),
            preview:
                null,
        };
    }
}

export async function createDoctorBlockWorkspaceAction(
    _previousState:
        DoctorBlockActionState,
    formData: FormData
): Promise<DoctorBlockActionState> {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const parsed =
        CreateDoctorBlockSchema.safeParse(
            getCreateBlockRawData(
                formData
            )
        );

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error
                    .issues[0]
                    ?.message ??
                "Los datos del bloqueo no son válidos.",
        };
    }

    try {
        const result =
            createDoctorBlockFromWorkspace(
                {
                    userId:
                        session.user.id,
                    input:
                        parsed.data,
                }
            );

        revalidatePath(
            "/doctor"
        );

        revalidatePath(
            "/doctor/agenda"
        );

        revalidatePath(
            "/doctor/blocks"
        );

        revalidatePath(
            "/staff"
        );

        revalidatePath(
            "/staff/appointments"
        );

        revalidatePath(
            "/staff/availability"
        );

        if (
            result.cancelledAppointments >
            0
        ) {
            return {
                ok: true,
                message:
                    `Bloqueo creado correctamente. Se cancelaron ${result.cancelledAppointments} citas afectadas.`,
            };
        }

        return {
            ok: true,
            message:
                "Bloqueo creado correctamente. No había citas programadas dentro del periodo.",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                getErrorMessage(
                    error
                ),
        };
    }
}

export async function deleteDoctorBlockWorkspaceAction(
    _previousState:
        DoctorBlockActionState,
    formData: FormData
): Promise<DoctorBlockActionState> {
    const session =
        await requireRole([
            ROLES.DOCTOR,
        ]);

    const parsed =
        DeleteDoctorBlockSchema.safeParse(
            {
                blockId:
                    String(
                        formData.get(
                            "blockId"
                        ) ?? ""
                    ),
            }
        );

    if (!parsed.success) {
        return {
            ok: false,
            message:
                parsed.error
                    .issues[0]
                    ?.message ??
                "El bloqueo no es válido.",
        };
    }

    try {
        deleteDoctorBlockFromWorkspace(
            {
                userId:
                    session.user.id,
                input:
                    parsed.data,
            }
        );

        revalidatePath(
            "/doctor"
        );

        revalidatePath(
            "/doctor/agenda"
        );

        revalidatePath(
            "/doctor/blocks"
        );

        revalidatePath(
            "/staff/availability"
        );

        return {
            ok: true,
            message:
                "Bloqueo eliminado correctamente. Las citas canceladas anteriormente no fueron reactivadas.",
        };
    } catch (error) {
        return {
            ok: false,
            message:
                getErrorMessage(
                    error
                ),
        };
    }
}