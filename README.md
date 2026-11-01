# Planificador de visitas

Prueba técnica: una agenda para cuatro técnicos que visitan obras. Permite programar, filtrar y cancelar visitas, con validación de horarios y desplazamientos en el servidor.

## Funciones

- Catálogos de cuatro técnicos y cuatro obras ficticias.
- Visitas con obra, técnico, fecha, hora de inicio y duración en minutos.
- Rechazo de solapamientos para el mismo técnico.
- Separación de al menos 30 minutos entre obras diferentes, tanto respecto a la visita anterior como a la posterior.
- Inicio y final dentro de 08:00–17:00.
- Cancelación persistente: conserva la fila y libera el horario.
- Listado ordenado por fecha/hora y filtros combinables por técnico y fecha.
- Transacciones y bloqueo por técnico para evitar reservas incompatibles simultáneas.

## Arranque local

Preparado para macOS o Linux. Prerrequisitos: Node.js **22.12+, 24 o 26** en una versión admitida por Vitest; probado en Node 26.10.0, npm y una base PostgreSQL accesible. La base puede ser Neon Free o una instalación PostgreSQL existente. La descarga de Node y el alta del proveedor son prerrequisitos. El ensayo desde una copia limpia, con caché npm inicialmente vacía y estos prerrequisitos listos, completó instalación, migración, semilla y primera carga en **18,66 s**. Condiciones y desglose en [docs/PRUEBAS.md](docs/PRUEBAS.md).

1. Clona el repositorio y entra en su carpeta.
2. Instala las versiones fijadas:

   ```bash
   npm ci
   ```

3. Copia `.env.example` a `.env.local`. Edita **localmente** `DATABASE_URL` con la conexión de PostgreSQL. En Neon: proyecto → Postgres → Connect → selecciona base y rol → copia la conexión. Conserva el cifrado indicado por Neon. No publiques esta conexión ni la pegues en el README.

   ```bash
   cp .env.example .env.local
   ```

4. Aplica el esquema y crea los catálogos ficticios:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Inicia la aplicación:

   ```bash
   npm run dev
   ```

Abre **http://127.0.0.1:3000**. **Mantén la terminal y el servidor en marcha mientras usas la aplicación.** Si detienes el proceso o cierras la terminal, una pestaña ya abierta puede seguir mostrando datos, pero no podrá consultar ni guardar. Vuelve a ejecutar `npm run dev` y recarga la página. La agenda muestra inicialmente el día actual en Madrid; pulsa Limpiar para consultar todas las fechas. La semilla crea catálogos, no reservas: las visitas se crean desde el formulario. Volver a ejecutar la semilla no duplica catálogos ni borra visitas.

El modo de desarrollo usa Webpack y sondeo de archivos para funcionar también en entornos macOS donde FSEvent está restringido. La compilación de producción usa el comando estándar de Next.js.

```bash
npm run build
npm start
```

## Comprobaciones

```bash
npm test                 # Reglas y entradas, sin base de datos
npm run typecheck        # TypeScript
npm run lint             # Calidad estática
npm run build            # Compilación de producción
```

Para integración, crea una **base separada y desechable** cuyo nombre termine en `_test`, aplica la misma configuración de acceso y añade su conexión a `TEST_DATABASE_URL` en `.env.local`:

```bash
npm run test:integration
```

Estas pruebas aplican migraciones, cargan catálogos y borran exclusivamente las visitas de su base de pruebas entre escenarios. Se niegan a ejecutar si falta la conexión, el nombre no termina en `_test` o coincide con el nombre de la base principal. No se debe usar la base de pruebas para datos que se quieran conservar.

La integración prueba las funciones HTTP del servidor, restricciones de PostgreSQL, cancelación, filtros y peticiones concurrentes desde conexiones independientes. Las comprobaciones en navegador y del usuario se documentan por separado en [docs/PRUEBAS.md](docs/PRUEBAS.md).

## Diseño técnico

Next.js + React + TypeScript, Tailwind/CSS, Zod, Drizzle, PostgreSQL y Vitest. Las peticiones entran por Route Handlers de Next.js y pasan a un servicio común de visitas. Las reglas puras no dependen de React ni de la base.

```text
src/app/          Página y endpoints HTTP
src/components/   Interfaz interactiva
src/client/       Peticiones y mensajes de conexión
src/domain/       Entradas, fechas y reglas de planificación
src/server/       Servicio transaccional y respuestas HTTP
src/db/           Esquema, conexión y semilla
drizzle/          Migraciones SQL y metadatos
scripts/          Migración y carga de catálogos
tests/            Pruebas unitarias y de integración
docs/             Decisiones, plan, trazabilidad y evidencias
```

Para cambiar el esquema, edita `src/db/schema.ts`, ejecuta `npm run db:generate`, revisa el SQL y aplica `npm run db:migrate`. No se ejecutan migraciones automáticamente durante cada petición o arranque de la web.

## Supuestos y límites

- Fecha y hora civil de Europe/Madrid; intervalos con final excluido. En la misma obra se admiten visitas consecutivas.
- Obra diferente significa ID diferente, incluso en el mismo municipio. No se calculan distancias reales.
- Duración entera positiva. No se añaden reglas de festivos, fines de semana, fechas pasadas ni pausa de comida.
- Las canceladas no intervienen en conflictos. No se incluye edición de visitas ni gestión completa de catálogos.
- Aplicación de demostración con datos ficticios y sin autenticación. Si se publica, cualquier visitante con acceso podrá crear/cancelar; el despliegue se decide expresamente. La comprobación de origen del navegador no sustituye autenticación.
- Las escrituras deben pasar por el servicio: las restricciones SQL protegen campos y referencias, pero las reglas entre distintas filas se garantizan en la transacción del servicio. Una escritura SQL externa puede omitir esas reglas.
- No se han implementado sugerencias de horarios ni servicios de IA dentro de la aplicación.

## Entrega y uso de IA

La [explicación técnica](docs/RESUMEN_TECNICO.md), también disponible en [PDF de una página](docs/RESUMEN_TECNICO.pdf), resume decisiones, pendientes, supuestos y una corrección real del contenido generado por IA. El [diario](docs/DIARIO_DESARROLLO.md) conserva las incidencias y su verificación. El [estado del proyecto](docs/ESTADO_PROYECTO.md) distingue lo implementado, comprobado y pendiente.

La publicación del repositorio y el despliegue están pendientes de autorización. No se incluyen el PDF original, conversaciones privadas ni credenciales en el contenido de entrega.
