import Link from "next/link";


export default function AccessDeniedPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
            <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-300">
                    Acceso denegado
                </p>

                <h1 className="mt-4 text-3xl font-bold">
                    No tienes permiso para entrar aquí.
                </h1>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                    Tu rol actual no tiene autorización para ver este módulo.
                </p>

                <Link
                    href="/"
                    className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                    Volver al inicio
                </Link>
            </section>
        </main>
    );
}