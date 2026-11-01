# Planificador de visitas

Prueba técnica: una agenda para cuatro técnicos que visitan obras. Permite buscar huecos, programar, reprogramar y cancelar visitas, consultar una agenda visual y gestionar la disponibilidad, con todas las reglas validadas en el servidor.

## Funciones

- Catálogos de cuatro técnicos y cuatro obras ficticias.
- Visitas con obra, técnico, fecha, hora de inicio y duración en minutos.
- Rechazo de solapamientos para el mismo técnico.
- Separación de al menos 30 minutos entre obras diferentes, tanto respecto a la visita anterior como a la posterior.
- Inicio y final dentro de 08:00–17:00.
- Cancelación persistente: conserva la fila y libera el horario.
- Listado ordenado por fecha/hora y filtros combinables por técnico y fecha.
- Transacciones y bloqueo por técnico para evitar reservas o ausencias incompatibles simultáneas.
- Búsqueda de hasta tres alternativas por huecos distintos, sin reservar hasta confirmar.
- Reprogramación atómica con control de versión, conservación de notas e historial de cambios.
- Agenda diaria del equipo y listado sobre los mismos datos; visitas cortas con acceso adicional.
- Bloqueos por franja o días completos. Rechaza los que afectan a visitas existentes o a sus viajes.
- Fichas de obra con dirección, contacto, teléfono y acceso, todos opcionales.
- Notas, incidencias y resultados opcionales en el detalle, sin cambiar el estado de planificación.
- Tipos configurables con duración editable al reservar; se conservan las pautas históricas.
- Avisos internos de actividad y próximas visitas en los 30 minutos anteriores.

## Arranque local

Preparado para macOS o Linux. Prerrequisitos: Node.js **22.12+, 24 o 26** en una versión admitida por Vitest; probado en Node 26.10.0, npm y una base PostgreSQL accesible. La base puede ser Neon Free o una instalación PostgreSQL existente. La descarga de Node y el alta del proveedor son prerrequisitos. La versión ampliada completó instalación, migración, semilla y primera carga en **14,30 s**, desde copia limpia y caché npm vacía, con estos prerrequisitos listos. La base de prueba ya tenía esquema: se comprobó la repetibilidad de migraciones y semilla. La migración inicial y la actualización desde el esquema anterior tienen pruebas separadas. Condiciones y desglose en [docs/PRUEBAS.md](docs/PRUEBAS.md).

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

Abre **http://127.0.0.1:3000**. **Mantén la terminal y el servidor en marcha mientras usas la aplicación.** Si detienes el proceso o cierras la terminal, una pestaña ya abierta puede seguir mostrando datos, pero no podrá consultar ni guardar. Vuelve a ejecutar `npm run dev` y recarga la página. La agenda muestra inicialmente el día actual en Madrid; pulsa Listado para cambiar de vista o Limpiar para consultar todas las fechas. La semilla crea catálogos, no reservas: las visitas se crean desde el formulario. Volver a ejecutar la semilla no duplica catálogos ni borra visitas.

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

Estas pruebas aplican migraciones, cargan catálogos y borran visitas, tipos, bloqueos, notas y eventos de su base de pruebas entre escenarios. También ensayan la actualización desde el esquema original en un esquema aislado. Se niegan a ejecutar si falta la conexión, el nombre no termina en `_test` o coincide con el nombre de la base principal. No se debe usar la base de pruebas para datos que se quieran conservar.

La integración prueba las funciones HTTP del servidor, restricciones de PostgreSQL y concurrencia desde conexiones independientes. Para recorrer las rutas por HTTP contra Next compilado, después de integración y sin ejecutarlos a la vez:

```bash
npm run build
npm run test:http
```

Este último comando inicia y detiene su propio servidor auxiliar, usa solo la base `_test` y limpia sus fixtures. La versión actual pasa 107 pruebas unitarias, 47 de integración y ese flujo HTTP completo. Las comprobaciones en navegador y del usuario se documentan por separado en [docs/PRUEBAS.md](docs/PRUEBAS.md).

Auditoría del 01/11/2026: `npm audit --omit=dev` no detecta vulnerabilidades conocidas. La auditoría completa señala un aviso moderado de `minimatch`, propagado a 18 paquetes de desarrollo; no ofrece corrección automática para las versiones instaladas. Alcance, decisión y seguimiento en [docs/SEGURIDAD.md](docs/SEGURIDAD.md).

## Uso de las ampliaciones

Programa con los cinco campos básicos. «Usar un tipo» es opcional y está plegado. «Buscar un horario libre» abre una consulta separada; elegir una propuesta rellena el formulario y requiere pulsar Programar visita. Abre una visita desde la tabla o la cuadrícula para ver la obra, reprogramar, cancelar, anotar o consultar el historial.

«Disponibilidad» gestiona ausencias por técnico. Si un bloqueo es incompatible, el mensaje identifica las visitas afectadas para resolverlas primero. «Obras y tipos» mantiene fichas y plantillas. «Avisos» reúne recordatorios y actividad con lectura por navegador.

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
- Las canceladas no intervienen en conflictos. El seguimiento no cambia Programada/Cancelada ni libera un hueco.
- Un bloqueo no representa una obra. Entre obras diferentes debe quedar un tramo libre continuo de 30 minutos; dos tramos separados no se suman. No se exige viaje antes de la primera visita ni después de la última.
- Reprogramar mantiene el ID, el tipo y las notas. Las versiones evitan sobrescribir una edición más reciente; los técnicos se bloquean en orden estable. Cambiar un tipo no altera duración ni pautas de visitas anteriores.
- La ficha permite editar datos operativos de las cuatro obras existentes; no se añade administración de técnicos u obras.
- Los avisos son compartidos, internos y requieren la aplicación abierta/conectada. Se actualizan cada 30 s visibles y al recuperar el foco. La lectura se guarda por navegador. Actividad: últimos 50 cambios de siete días; historial de cada visita conservado completo. No hay correo ni notificaciones con navegador cerrado.
- Aplicación de demostración con datos ficticios y sin autenticación. Si se publica, cualquier visitante con acceso podrá consultar y modificar la agenda; el despliegue se decide expresamente. La comprobación de origen del navegador no sustituye autenticación.
- Las escrituras deben pasar por el servicio: las restricciones SQL protegen campos y referencias, pero las reglas entre distintas filas se garantizan en la transacción del servicio. Una escritura SQL externa puede omitir esas reglas.
- Las sugerencias son deterministas y revisan minutos enteros con las mismas reglas de reserva. No hay servicios de IA en ejecución.

## Entrega y uso de IA

La [explicación técnica](docs/RESUMEN_TECNICO.md), también disponible en [PDF de una página](docs/RESUMEN_TECNICO.pdf), resume decisiones, pendientes, supuestos y una corrección real del contenido generado por IA. El [diario](docs/DIARIO_DESARROLLO.md) conserva las incidencias y su verificación. El [estado del proyecto](docs/ESTADO_PROYECTO.md) distingue lo implementado, comprobado y pendiente.

La publicación del repositorio y el despliegue están pendientes de autorización. No se incluyen el PDF original, conversaciones privadas ni credenciales en el contenido de entrega.
