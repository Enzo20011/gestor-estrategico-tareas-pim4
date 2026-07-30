# Gestor estratégico de tareas — PIM4

Aplicación web SPA del gestor estratégico de tareas. Permite autenticación de usuarios, CRUD de tareas persistido en Firestore, envío de resúmenes por email con AWS SES, y deploy en producción.

## 🚀 Demo

🔗 **https://gestor-estrategico-tareas-pim4.vercel.app**

---

## 🛠 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Auth + DB | Firebase (Auth + Firestore) |
| Email | AWS SES via Vercel Functions |
| Deploy | Vercel |
| Testing | Vitest + React Testing Library |

---

## 📁 Estructura del proyecto

```
project-root/
├── src/
│   ├── pages/          # Vistas: LoginPage, RegisterPage, TasksPage
│   ├── components/     # UI: TodoForm, TodoList, TodoItem
│   ├── features/       # Lógica por dominio (auth, tasks)
│   ├── services/       # Firebase, authService, taskService
│   ├── routes/         # ProtectedRoute
│   ├── hooks/          # useAuth, useTasks
│   ├── types/          # Tipos e interfaces TypeScript
│   └── utils/          # Helpers
├── api/
│   └── send-email.ts   # Vercel Function — AWS SES
├── tests/
│   ├── components/     # Tests de componentes
│   └── services/       # Tests de servicios
├── .env.example
└── README.md
```

---

## ⚙️ Instalación y configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/<tu-usuario>/task-manager-matecode.git
cd task-manager-matecode
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y completar con tus credenciales:

```bash
cp .env.example .env
```

### 4. Iniciar en desarrollo

```bash
npm run dev
```

La app estará en: `http://localhost:5173`

---

## 🔑 Variables de entorno

```env
# Firebase — obtener desde Firebase Console > Configuración del proyecto
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# AWS SES — solo para Vercel Functions, NUNCA en el frontend
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
SES_FROM_EMAIL=
```

> ⚠️ El archivo `.env` está en `.gitignore` y NUNCA debe subirse al repositorio.

---

## 📧 Flujo de envío de emails

1. El usuario hace clic en **"Enviar resumen"** en la página de tareas.
2. El frontend llama a `POST /api/send-email` con el email del usuario y la lista de tareas.
3. La **Vercel Function** (`api/send-email.ts`) recibe la solicitud del lado del servidor.
4. La función usa el **AWS SDK** para llamar a AWS SES con las credenciales de entorno.
5. AWS SES envía el email HTML con el resumen de tareas al usuario.

Las credenciales de AWS **nunca se exponen al cliente**: viven únicamente en variables de entorno del servidor (Vercel).

---

## 🏗 Decisiones arquitectónicas

- **BaaS con Firebase**: Se eligió Firebase (Auth + Firestore) para evitar un backend propio, cumpliendo el requisito de solución rápida y escalable.
- **Vercel Functions para emails**: AWS SES requiere credenciales secretas; usar Vercel Functions mantiene los secretos en el servidor y el frontend limpio.
- **Filtrado por `userId`**: Todas las queries a Firestore incluyen `where('userId', '==', uid)` garantizando que cada usuario solo ve sus propias tareas.
- **ProtectedRoute**: Componente wrapper que verifica el estado de autenticación antes de renderizar rutas privadas, con estado de carga para evitar flickers.
- **Hooks personalizados**: `useAuth` y `useTasks` encapsulan lógica de negocio separada de la UI, facilitando el testing y la reutilización.
- **Estructura por capas**: `pages/`, `components/`, `services/`, `hooks/`, `types/` siguiendo separación de responsabilidades.

---

## 🧪 Testing

```bash
npm test            # Correr tests una vez
npm run test:watch  # Modo watch
```

**Cobertura actual — 23 tests pasando:**
- `TodoForm.test.tsx` — 5 tests ✅
- `TodoList.test.tsx` — 3 tests ✅
- `TodoItem.test.tsx` — 9 tests ✅
- `taskService.test.ts` — 6 tests ✅

---

## 🚀 Deploy en Vercel

1. Conectar el repositorio de GitHub en [vercel.com](https://vercel.com)
2. Configurar variables de entorno en Vercel Dashboard > Settings > Environment Variables
3. Vercel detecta automáticamente Vite y configura el build
4. Las Vercel Functions en `/api` se despliegan automáticamente

---

## 🤖 Uso de IA en el proceso de desarrollo

Durante el desarrollo usé IA (Antigravity / Gemini) para consultas puntuales: dudas concretas que surgían mientras escribía el código, no para generar features enteras.

---

**¿Cómo convierto un `Timestamp` de Firestore a `Date` de JavaScript sin que TypeScript se queje?**

> **IA:** Usá `(data.dueDate as Timestamp).toDate()` y agregá el chequeo `data.dueDate ?` antes para los campos opcionales. Si `createdAt` siempre existe, podés usar `?.toDate() ?? new Date()` como fallback.

Aplicado en [`taskService.ts`](file:///c:/Users/enzul/OneDrive/Escritorio/PIm4/src/services/taskService.ts) al mapear los documentos de Firestore.

---

**Cuando el usuario recarga la página, por un instante aparece el login aunque esté autenticado. ¿Cómo evito ese flash?**

> **IA:** Firebase tarda un tick en resolver `onAuthStateChanged`. Agregá un estado `loading: true` inicial en el contexto y en `ProtectedRoute` devolvé un spinner mientras `loading` sea `true`, antes de evaluar si hay usuario.

Quedó implementado en [`useAuth.tsx`](file:///c:/Users/enzul/OneDrive/Escritorio/PIm4/src/hooks/useAuth.tsx) y [`ProtectedRoute.tsx`](file:///c:/Users/enzul/OneDrive/Escritorio/PIm4/src/routes/ProtectedRoute.tsx).

---

**Quiero que el drag-and-drop de tareas persista el orden en Firestore, pero sin hacer una request por cada tarea movida.**

> **IA:** Usá `writeBatch` del SDK de Firestore: guardás todos los cambios de `order` en un batch y los commiteás en una sola operación. Para la UX, hacé el update del estado local primero (optimistic update) y si falla el batch, revertís con un refetch.

Implementado en `reorderTasks()` dentro de [`taskService.ts`](file:///c:/Users/enzul/OneDrive/Escritorio/PIm4/src/services/taskService.ts) y en `reorder()` de [`useTasks.ts`](file:///c:/Users/enzul/OneDrive/Escritorio/PIm4/src/hooks/useTasks.ts).

---

**¿Cómo tipar el parámetro de `updateTask` para que solo acepte los campos editables, no todos los campos de `Task`?**

> **IA:** Usá `Partial<Pick<Task, 'title' | 'description' | 'completed' | 'priority' | 'dueDate'>>`. `Pick` selecciona solo esos campos y `Partial` los hace todos opcionales.

Aplicado en la firma de [`updateTask`](file:///c:/Users/enzul/OneDrive/Escritorio/PIm4/src/services/taskService.ts) y [`editTask`](file:///c:/Users/enzul/OneDrive/Escritorio/PIm4/src/hooks/useTasks.ts).

---

**¿Cómo evito que las credenciales de AWS queden expuestas en el frontend al llamar a SES?**

> **IA:** Nunca llamés al SDK de AWS desde el cliente. Creá una Vercel Function en `/api/send-email.ts` — se ejecuta en el servidor de Vercel y las credenciales viven como variables de entorno del servidor, inaccesibles desde el browser. El frontend solo hace `fetch('/api/send-email', { method: 'POST', body: ... })`.

Aplicado en [`api/send-email.ts`](file:///c:/Users/enzul/OneDrive/Escritorio/PIm4/api/send-email.ts).

---

**Lo que aprendí del proceso:**
- Describir el problema concreto (con el error o la limitación) da mejores resultados que pedir que "genere algo".
- La IA es útil para conocer APIs que no conocés bien (Firestore batch, TypeScript utility types), pero el contexto y la integración los tenés que entender vos.
- Siempre revisé el código generado antes de usarlo, especialmente lo relacionado con seguridad y autenticación.

---

## 📜 Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo en localhost:5173 |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build de producción |
| `npm test` | Correr todos los tests |
| `npm run test:watch` | Tests en modo watch |
