# ClinicFlow

ClinicFlow es un sistema web para la administración de una clínica privada desarrollado con Next.js, TypeScript y SQLite.

El proyecto implementa cuatro roles independientes:

- SUPERUSER
- STAFF
- DOCTOR
- PATIENT

Cada rol posee permisos y flujos completamente separados.

---

# Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- SQLite
- better-sqlite3
- Zod
- bcryptjs

No utiliza ORM.

---

# Requisitos

- Node.js 20+
- pnpm
- SQLite3

---

# Instalación

Instalar dependencias:

```bash
pnpm install
```

Variables de entorno:

Crear `.env.local`

```env
DATABASE_PATH="./db/cliniflow.sqlite"
APP_NAME="ClinicFlow"
```

---

# Base de datos

Inicializar una base nueva:

```bash
pnpm db:init
```

Aplicar migraciones:

```bash
pnpm db:migrate
```

Validar integridad:

```bash
pnpm db:integrity
```

---

# Datos de prueba

Crear SUPERUSER:

```bash
pnpm seed:superuser
```

Crear usuarios básicos:

```bash
pnpm seed:auth-users
```

Configurar horarios y datos de prueba para Staff:

```bash
pnpm seed:staff-test-data
```

---

# Desarrollo

Servidor:

```bash
pnpm dev
```

Lint:

```bash
pnpm lint
```

Build:

```bash
pnpm build
```

Producción:

```bash
pnpm start
```

---

# Estructura principal

```
db/
scripts/
src/
    app/
    components/
    server/
    shared/
```

---

# Arquitectura

La aplicación está organizada en capas.

```
UI
↓

Server Actions
↓

Services

↓

Repositories

↓

SQLite
```

Las reglas de negocio viven únicamente en Services.

Repositories únicamente realizan acceso a datos.

Las páginas nunca consultan SQLite directamente.

---

# Roles

## SUPERUSER

- Administración de usuarios
- Activar y desactivar cuentas

## STAFF

- Registro de pacientes
- Agenda de citas
- Reagendar
- Cancelar citas

No puede acceder a información clínica.

## DOCTOR

- Agenda médica
- Horarios
- Bloqueos
- Expedientes
- Notas médicas

## PATIENT

- Perfil
- Próximas citas
- Historial
- Recetas
- Expediente

---

# Seguridad

Todas las rutas protegidas requieren sesión válida.

Las Server Actions validan permisos mediante `requireRole()`.

Staff y Superuser nunca pueden consultar:

- diagnósticos
- tratamientos
- recetas
- notas médicas

---

# Migraciones

Las migraciones son inmutables.

Una migración aplicada nunca debe modificarse.

Los cambios posteriores deben implementarse mediante un nuevo archivo SQL.

---

# Licencia

Proyecto académico.