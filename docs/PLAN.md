# Planificador de visitas — propuesta de trabajo

**Actualización 01/11/2026:** la ampliación seleccionada por el usuario y su secuencia vigente se describen en [PLAN_AMPLIACION.md](PLAN_AMPLIACION.md). Este archivo conserva el plan inicial.

Fecha: 30/10/2026. Estado: aprobado por el usuario. Plazo comunicado por el usuario: **dos días restantes**; hora límite sin confirmar.

Aprobados el núcleo, arquitectura, carpeta, supuestos y Neon Free. La publicación en GitHub, el despliegue y la mejora opcional mantienen sus puntos de aprobación posteriores. Las secciones siguientes conservan el plan original como referencia; el estado vigente se registra en ESTADO_PROYECTO.md y PRUEBAS.md.

## 1. Comprensión y alcance

La aplicación sustituirá una planificación en hoja de cálculo por una pantalla que permita crear, consultar y cancelar visitas de cuatro técnicos a obras. El valor principal es impedir conflictos y explicar por qué una visita no puede guardarse.

Fuentes leídas íntegramente:

- PDF original «Prueba técnica - Planificador de visitas», tres páginas, proporcionado por el usuario. Referencia principal para los requisitos de Talent Clau.
- Texto «PROMPT MAESTRO DEFINITIVO», proporcionado por el usuario. Propuesta de arquitectura, metodología y seguimiento que se somete a aprobación junto con este plan.
- Mensaje del usuario: analizar y estructurar primero; comenzar después de su confirmación.

Distinciones relevantes:

- El PDF permite entregar funcionalidades pendientes si se explican. El texto propone completar y verificar todo el núcleo. Recomendación: intentar completar el núcleo dentro de los dos días y revisar el alcance si el tiempo no alcanza, sin ocultar pendientes.
- El PDF exige una base relacional y recomienda PostgreSQL; no obliga a usar PostgreSQL ni Next.js. Mantenerlos sería una decisión nuestra, alineada con las tecnologías valoradas.
- El PDF no exige siete documentos internos, Vitest, un ORM ni sugerencias de horarios. El seguimiento y las pruebas se proponen para aportar evidencia y facilitar el aprendizaje, manteniéndolos concisos.
- La referencia de 2–3 horas del PDF es orientativa. No se promete cumplir todo el proceso ampliado en ese tiempo. Se revisará el progreso al alcanzar ese esfuerzo.
- El repositorio público es obligatorio; la aplicación publicada es valorable. El envío a Talent Clau será una acción posterior del usuario o requerirá una instrucción expresa.

## 2. Requisitos y trazabilidad inicial

Todos los requisitos de aplicación y entrega están pendientes. Los identificadores RF dividen las cinco funcionalidades del PDF en unidades comprobables; no son numeración original del enunciado.

| ID | Origen | Requisito | Implementación prevista | Verificación prevista |
|---|---|---|---|---|
| RF-01 | PDF §1 y §2.1 | Técnicos y obras, con datos ficticios | Esquema, cuatro técnicos, obras y selectores | INT-01, MAN-01 |
| RF-02 | PDF §2.2 | Crear con obra, técnico, fecha, inicio y duración; explicar rechazos | Formulario, entrada de servidor y servicio | UNIT-01, INT-02/03, MAN-01 |
| RF-03 | PDF §2.3a | Impedir solapamientos del mismo técnico | Reglas de planificación | UNIT-03/04, INT-06, MAN-02 |
| RF-04 | PDF §2.3b | Al menos 30 minutos entre obras diferentes | Reglas en ambos sentidos temporales | UNIT-05/06, MAN-03 |
| RF-05 | PDF §2.3c | Inicio y final dentro de 08:00–17:00 | Validación de jornada y restricciones de datos | UNIT-02, MAN-04 |
| RF-06 | PDF §2.4 | Cancelar, conservar visible y liberar horario | Cambio de estado persistente | INT-04, MAN-05 |
| RF-07 | PDF §2.5 | Listado con campos exigidos y orden fecha/hora | Consulta y tabla | INT-05, MAN-06 |
| RF-08 | PDF §2.5 | Filtros por técnico y fecha | Consulta parametrizada y controles | INT-05, MAN-06 |
| RT-01 | PDF §3 | Base de datos relacional | PostgreSQL y migraciones | INT-01/02, ENT-01 |
| RT-02 | PDF §3 | Validación también en servidor | Entrada validada y reglas compartidas por las escrituras | INT-03/06 |
| RT-03 | PDF §3 | Ningún secreto en el repositorio | Variables privadas, ejemplo sin valores y revisión de Git | ENT-02 |
| EN-01 | PDF §4 | GitHub público con código, esquema o migraciones y datos | Preparación local y publicación autorizada | ENT-01/02/03 |
| EN-02 | PDF §4 | README para ejecutar localmente en menos de diez minutos | Ruta de instalación comprobada | ENT-01 |
| EN-03 | PDF §4 | Explicación de una página como máximo | Resumen técnico | ENT-04 |
| EN-04 | PDF §4 | Uso de IA y un caso real de corrección | Registro durante el trabajo y resumen final | ENT-04 |
| OP-01 | PDF §4 | URL publicada, valorable | Despliegue solo si se aprueba | ENT-05 |
| OP-02 | Elección nuestra bajo PDF §5 | Sugerencia determinista de horario | Fase 6 opcional | OPT-01 |

Quedan fuera del núcleo propuesto: gestión completa de técnicos y obras, edición de visitas, usuarios y roles, mapas, rutas reales, notificaciones y calendario gráfico. Ninguna de estas funciones es exigida por el PDF.

## 3. Entorno comprobado

Inspección de solo lectura, salvo archivos de revisión del PDF y este documento, dentro del espacio de trabajo autorizado.

| Elemento | Resultado |
|---|---|
| Arquitectura | arm64 |
| Node.js | v26.10.0 |
| npm | 11.19.1 |
| pnpm | 11.25.0, disponible mediante runtime de Codex |
| Git | 2.50.1 |
| GitHub CLI | 2.102.0; autenticación no comprobada |
| Homebrew | Ejecutable localizado |
| Visual Studio Code | Aplicación localizada |
| PostgreSQL y Docker | Ejecutables no encontrados en PATH ni en la búsqueda dirigida de Homebrew; Postgres.app y Docker.app no localizadas en /Applications |
| Carpeta de esta conversación | Sin aplicación ni package.json existente |

La versión encontrada de Node supera el mínimo 20.9 documentado por Next.js. Esto no prueba por sí solo la compatibilidad de todas las dependencias: se verificará al inicializar y compilar. Se propone usar npm, un solo archivo de bloqueo de versiones y dependencias locales. No hay una necesidad comprobada de instalar herramientas globales para empezar con Neon.

Fuente: [instalación de Next.js](https://nextjs.org/docs/app/getting-started/installation), consultada el 30/10/2026.

## 4. Arquitectura propuesta

Una única aplicación Next.js con React y TypeScript. Tailwind para estilos; Zod para validar entradas; Drizzle para esquema, consultas y migraciones; PostgreSQL para persistencia; Vitest para pruebas de reglas e integración.

Se mantiene la arquitectura principal del texto. La organización será pequeña: interfaz, reglas de negocio independientes, servicio de visitas y acceso a datos. Facilita probar las reglas sin abrir el navegador y explicarlas por separado durante la entrevista.

Flujo de creación: formulario → función del servidor → validar campos → abrir transacción → comprobar disponibilidad con datos actuales → guardar o rechazar → actualizar listado y mensaje. La base de datos solo será accesible desde el servidor. Los filtros se aplicarán en las consultas, y las canceladas quedarán visibles.

Modelo propuesto:

| Entidad | Datos principales | Relación |
|---|---|---|
| Técnico | ID, nombre | Un técnico tiene muchas visitas |
| Obra | ID, nombre, municipio | Una obra tiene muchas visitas |
| Visita | ID, técnico, obra, fecha, inicio en minutos, duración en minutos, estado | Referencias obligatorias a técnico y obra |

El final se calculará como inicio + duración. Evitaremos guardar dos valores que puedan contradecirse. Añadiremos claves foráneas, duración positiva, estados válidos y límites de jornada; el servidor comprobará también las restricciones entre visitas.

Supuestos propuestos para aprobar:

1. Horario civil de Europe/Madrid para todas las obras; fecha y minutos del día, sin conversiones automáticas que desplacen una reserva.
2. Duración entera positiva en minutos; sin imponer saltos de 15 o 30 minutos que el PDF no pide.
3. Intervalos con final no incluido: 09:00–10:00 y 10:00–11:00 son consecutivos. En la misma obra se permiten; en obras distintas hacen falta 30 minutos.
4. «Obra diferente» se determina por su ID, aunque las obras estén en el mismo municipio.
5. Se comprueban únicamente visitas Programadas del mismo técnico y fecha. Las Canceladas no bloquean ni generan desplazamiento.
6. No se introducen restricciones de fines de semana, festivos, fechas pasadas o pausa de comida; el PDF no las define.
7. Los filtros de técnico y fecha podrán combinarse. Orden ascendente por fecha y hora, con ID como desempate estable.
8. Cancelar dos veces no elimina datos ni produce un segundo efecto. Una visita inexistente devuelve un error claro.
9. La primera versión es una demostración con datos ficticios y sin cuentas de usuario, conforme al alcance propuesto.

Para peticiones simultáneas, se propone una transacción que bloquee la fila del técnico antes de consultar su agenda y crear/cancelar. Todas las escrituras pasarán por ese camino. Con aislamiento READ COMMITTED, la consulta posterior al bloqueo verá los cambios confirmados de la operación previa. Bloquear la fila estable del técnico también funciona cuando todavía no tiene visitas. Es una decisión proporcional a cuatro técnicos, pendiente de probar con conexiones independientes.

El controlador PostgreSQL elegido deberá soportar transacciones interactivas; no se asumirá que cualquier transporte HTTP sirve. Referencias: [bloqueos de PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html), [transacciones en Drizzle](https://orm.drizzle.team/docs/transactions).

## 5. Base de datos y coste

Recomendación pendiente de autorización: **Neon Free**, con aplicación ejecutándose inicialmente en el Mac. Evita instalar un servidor PostgreSQL y conserva la base recomendada. Requiere cuenta, conexión a Internet y guardar la conexión en una variable privada local.

La página de precios consultada el 30/10/2026 anuncia Free sin tarjeta: 100 CU-h por proyecto al mes, 1 GB de base de datos por proyecto, suspensión automática tras cinco minutos inactivo y 5 GB de transferencia por proyecto. Son recursos suficientes previsiblemente para esta demostración; habrá límites de uso y posible demora al reactivarse. Se revisará que el alta siga en Free y no active facturación. [Fuente: Neon](https://neon.com/pricing).

Alternativa: PostgreSQL local. Conserva el motor y permite trabajar sin el servicio remoto, pero requiere preparar una instalación en este Mac y aprobar ese cambio. No se propone instalar Docker exclusivamente para esta prueba.

Vercel Hobby queda para una decisión posterior: es gratuito para uso personal no comercial. La documentación anuncia 100 GB de transferencia, un millón de invocaciones y cuatro horas de CPU activa; superar límites puede suspender funciones hasta el restablecimiento de la cuota. Por tratarse de una prueba ficticia personal, parece una opción razonable, pero se confirmará el encaje y las condiciones al preparar el despliegue. [Fuente: Vercel Hobby](https://vercel.com/docs/plans/hobby).

No se han creado servicios externos ni introducido métodos de pago.

## 6. Estructura propuesta de la aplicación

Carpeta propuesta: `planificador-visitas`, dentro del espacio autorizado.

| Ubicación dentro del proyecto | Responsabilidad |
|---|---|
| src/app/ | Página, estructura y entradas de servidor |
| src/components/ | Formulario, filtros, tabla y cancelación |
| src/domain/ | Reglas de jornada, intervalos y desplazamientos |
| src/server/ | Servicio de creación, cancelación y consultas |
| src/db/ | Conexión, esquema y datos ficticios |
| drizzle/ | Migraciones SQL versionadas |
| tests/unit/ | Casos de las reglas sin depender de la base |
| tests/integration/ | Casos con PostgreSQL y entradas de servidor |
| docs/ | Plan, requisitos, diario, estado, pruebas y resumen |
| README.md y .env.example | Arranque reproducible y variables sin secretos |

Pantalla principal: título y acción para crear; filtros por fecha y técnico; tabla con fecha, inicio/final, técnico, obra, estado y cancelación. Formulario próximo al listado en escritorio y apilado en móvil. Estados con texto visible, mensajes asociados a campos y aviso específico de la regla incumplida. La distribución se explicará antes de construirla.

## 7. Fases, subfases y microtareas

Se agrupan las microtareas del texto en unidades comprobables para evitar una gestión desproporcionada. P0 significa núcleo necesario; P1 entrega y calidad; P2 opcional. Las fases 0 y 1 tienen análisis realizado, pero sus decisiones siguen pendientes de aprobación. Las demás no han comenzado.

Cada subfase seguirá: explicar objetivo → definir casos → implementar → ejecutar pruebas → corregir y repetir lo afectado → ofrecer comprobación manual → registrar resultados y siguiente paso. Un commit local coherente cerrará cada hito verificado.

| Subfase / prioridad | Objetivo y requisitos | Microtareas e implementación prevista | Dependencia | Prueba y criterio de aceptación / resultado |
|---|---|---|---|---|
| 0.1 Fuentes y carpeta / P0 | Comprender el encargo | Leer ambos documentos, localizar espacio y separar exigencias de propuestas | Archivos del usuario | Lectura completa y matriz; realizado |
| 0.2 Entorno / P0 | Identificar preparación necesaria | Comprobar herramientas y posibles bases; no instalar | 0.1 | Inventario con versiones y limitaciones; realizado |
| 1.1 Alcance / P0 | RF-01–08, RT, EN | Asociar cada requisito al PDF, definir supuestos y prioridades | 0.1 | Todos los requisitos tienen fase y prueba; propuesta preparada |
| 1.2 Diseño / P0 | Arquitectura y datos | Definir tres entidades, flujo, pantalla y concurrencia | 1.1 | Reglas y modelo coherentes; pendiente de aprobación |
| 1.3 Plan y aceptación / P0 | Método y plazo | Aprobar alcance, base, carpeta, supuestos y calendario | 0.2, 1.2 | Confirmación del usuario antes de programar |
| 2.1 Base del proyecto / P0 | Preparación técnica | Crear carpeta; comprobar límites de Git; inicializar Next/TS/Tailwind; npm local; scripts y .gitignore; documentos de seguimiento | 1.3 aprobada | Arranque, TypeScript, lint y build inicial correctos; ningún secreto versionado |
| 2.2 Persistencia / P0 | RF-01, RT-01, EN-01 | Configurar base autorizada; definir tablas, claves y restricciones; generar y aplicar migración | 2.1 y acceso a PostgreSQL | INT-01: migración en base vacía, relaciones válidas, datos incorrectos rechazados |
| 2.3 Datos y lectura / P0 | RF-01, EN-01 | Crear cuatro técnicos y obras ficticias; semilla repetible sin borrar visitas; consultar desde servidor | 2.2 | INT-01: segunda ejecución no duplica catálogos; lectura real desde base |
| 3.1 Entrada y horario / P0 | RF-02, RF-05, RT-02 | Definir fecha/minutos; validar campos, identificadores, duración y jornada; mensajes de error | 2.1; datos para integración | UNIT-01/02: casos válidos y límites coinciden con resultados esperados |
| 3.2 Disponibilidad / P0 | RF-03/04 | Implementar intersección de intervalos; desplazamiento anterior y posterior; excluir canceladas | 3.1 | UNIT-03–07: todos los solapamientos y márgenes comprobados |
| 3.3 Crear de forma segura / P0 | RF-02–05, RT-02 | Integrar transacción, bloqueo del técnico, lectura actual y reglas; guardar solo si todo es válido | 2.3, 3.2 | INT-02/03/06: persiste lo válido, rechaza lo inválido y no admite conflictos simultáneos |
| 3.4 Cancelar y consultar / P0 | RF-06–08 | Cambiar estado, conservar fila; listar y ordenar; filtros individuales y combinados | 3.3 | INT-04/05: horario libre, cancelada visible y filtros correctos |
| 4.1 Presentación y listado / P0 | RF-01, RF-07/08 | Explicar distribución; construir tabla, filtros, estados y resultado vacío | 3.4 | MAN-06 y revisión en navegador: campos legibles, orden y filtros verificables |
| 4.2 Crear y cancelar / P0 | RF-02/06 | Integrar formulario, carga, confirmación de cancelación, errores y refresco | 4.1 | MAN-01–05: flujo completo sin perder datos ni ocultar rechazos |
| 5.1 Auditoría automática / P0 | Todos los RF y RT | Ejecutar unitarias e integración; comprobar peticiones directas, recarga, concurrencia, lint, tipos y compilación | Fases 3 y 4 | Resultados reales registrados; cero fallos bloqueantes en la batería aplicable |
| 5.2 Validación contigo / P0 | RF-01–08 | Ejecutar guion manual con datos conocidos; registrar tu respuesta; corregir y repetir lo afectado | 5.1 | Cada escenario validado por ti o marcado como pendiente; sin atribuirte pruebas no confirmadas |
| 6.1 Alternativa horaria / P2 | OP-02 | Solo con permiso: definir ventana de búsqueda; algoritmo determinista; reutilizar reglas; mensaje de alternativa o ausencia | Núcleo verificado, margen y aprobación expresa | OPT-01: ninguna sugerencia viola duración, jornada, conflictos o desplazamientos |
| 7.1 Ejecución reproducible / P1 | EN-01/02, RT-03 | Completar README, variables de ejemplo, migraciones y semilla; ensayar instalación desde copia limpia | Núcleo funcional | ENT-01/02: instrucciones verificadas y tiempo real registrado; secretos ausentes |
| 7.2 Explicación y evidencias / P1 | EN-03/04 | Resumir realizado, pendientes, decisiones, supuestos, IA y corrección real; auditoría requisito por requisito | Registro de desarrollo | ENT-04: una página como máximo; hechos respaldados por evidencias |
| 7.3 GitHub / P1 | EN-01 | Preparar contenido final, revisar archivos e historial; mostrar qué se publicará; solicitar publicación | 7.1/7.2 y autorización | ENT-03: repositorio público y contenido comprobados tras publicar |
| 7.4 Despliegue / P2 | OP-01 | Solo con permiso y margen: configurar entorno gratuito; desplegar; comprobar URL y flujos | 7.1 y autorización | ENT-05: crear/rechazar/cancelar/listar funcionan en la URL |

La fase 7 se prepara desde el principio y no depende de hacer la fase 6.

## 8. Distribución de los dos días

**Día 1:** aprobar plan y base → preparar proyecto → esquema y semilla → reglas y pruebas → creación/cancelación/listado → interfaz funcional. Hito: abrir la aplicación y completar una visita válida, un rechazo y una cancelación con persistencia.

**Día 2:** cerrar cualquier parte pendiente del núcleo → integración, límites y concurrencia → pruebas manuales contigo → correcciones → ensayo de instalación → explicación de una página → revisión y publicación autorizada del repositorio. La URL y sugerencias se valoran después de asegurar la entrega obligatoria.

Se revisará el progreso al acumular 2–3 horas de trabajo. Si el núcleo no está cerrado, se informará del bloqueo y del tiempo restante antes de acordar cualquier reducción. Se reservará el último bloque para preparar la entrega, sin introducir funcionalidades nuevas.

No se fija una hora de vencimiento a partir de «dos días»: falta confirmarla. Las cuentas y credenciales necesarias pueden condicionar el arranque; resolver la elección de base es el primer punto externo.

## 9. Pruebas previstas, todavía no ejecutadas

Las unitarias comprobarán reglas puras. Las de integración usarán PostgreSQL real con datos controlados y entorno de pruebas separado. El guion manual comprobará el comportamiento visible. Una llamada directa a la entrada de servidor verificará que saltarse el formulario no evita las reglas.

| ID | Casos / preparación | Resultado esperado |
|---|---|---|
| UNIT-01 | Campos ausentes, IDs incorrectos, fecha imposible, hora mal formada, duración cero/negativa/fraccionaria | Rechazo claro; caso completo válido aceptado |
| UNIT-02 | 07:59, 08:00; final 17:00 y 17:01; duración excesiva | Solo visitas completamente dentro de jornada aceptadas |
| UNIT-03 | Solapamiento parcial en ambos sentidos, contenida, contenedora, idéntica, mismo inicio | Rechazo para el mismo técnico |
| UNIT-04 | Consecutivas misma obra; simultáneas de técnicos distintos | Aceptadas cuando no existe otra restricción |
| UNIT-05 | Obra diferente con 15, 29, 30 y 31 minutos; misma obra con cero | Rechazo con menos de 30 en distinta obra; resto válido |
| UNIT-06 | Conflicto con anterior, con posterior y al insertar entre dos visitas | Comprobar ambos lados, incluso si uno de ellos cumple |
| UNIT-07 | Visita conflictiva cancelada, otro día u otro técnico | No bloquea esta reserva |
| INT-01 | Migrar base vacía, ejecutar semilla dos veces, leer catálogos y comprobar restricciones | Esquema reproducible; cuatro técnicos; sin duplicados ni relaciones inválidas |
| INT-02 | Crear visita válida y leer desde otra conexión | Fila persistida con datos y estado correctos |
| INT-03 | Enviar directamente solicitudes inválidas, incluidos solapamiento, jornada y desplazamiento | Rechazo del servidor y ausencia de nueva fila |
| INT-04 | Cancelar; volver a cancelar; consultar; crear nueva en el horario liberado | Fila original conservada, Cancelada, horario disponible; ID inexistente tratado |
| INT-05 | Mezclar días, horas, técnicos y estados; filtrar fecha/técnico/ambos y sin resultados | Orden estable, coincidencias correctas y canceladas visibles |
| INT-06 | Dos conexiones crean visitas incompatibles simultáneamente sobre agenda vacía y ocupada | Solo una incompatible se guarda; incluye margen insuficiente entre obras, no solo solapamiento |
| ENT-01 | Seguir README desde copia limpia y base preparada según prerrequisitos explícitos | Arranque comprobado en menos de diez minutos; medir y registrar, sin prometerlo antes |
| ENT-02 | Revisar archivos e historial que se publicarán | Sin claves, contraseñas, conexiones privadas ni documentos personales |
| ENT-03 | Abrir repositorio publicado y revisar contenidos | Público y completo |
| ENT-04 | Contrastar resumen con matriz, diario y cambios reales | Una página, todos los apartados y corrección auténtica de IA |
| ENT-05 | Repetir flujos esenciales en despliegue autorizado | Resultado correcto sobre la base configurada |
| OPT-01 | Alternativa antes/después de visitas, final de jornada, hueco corto, canceladas y día sin hueco | Solo horarios válidos o mensaje de ausencia; sin API de IA |

Para cada ejecución se registrarán comando, fecha, commit cuando exista, casos correctos/fallidos y referencia de evidencia. Se repetirán pruebas afectadas tras una corrección y la batería pertinente antes de cerrar el núcleo.

## 10. Cómo podrás comprobarlo tú

Guion para una fecha de prueba D y técnicos/obras ficticios. Se facilitará la URL local cuando exista. Los escenarios se ejecutarán con datos aislados o fechas distintas para no producir interferencias.

| ID | Acción | Qué deberías ver |
|---|---|---|
| MAN-01 | Elegir Carlos y Obra A; crear D 09:00 durante 60 minutos; recargar | Visita Programada, 09:00–10:00, mismos datos tras recargar |
| MAN-02 | Intentar otra para Carlos a las 09:30; repetir con otro técnico | Carlos rechazado por solapamiento; otro técnico permitido |
| MAN-03 | Con visita 09:00–10:00 en A, intentar Carlos/B a las 10:15 y después 10:30 | Rechazo por desplazamiento a las 10:15; aceptación a las 10:30 si no hay otro conflicto |
| MAN-04 | En un día libre probar 07:59; 08:00; 16:30 con 30 y con 31 minutos | 07:59 y final 17:01 rechazados; límites 08:00 y 17:00 permitidos |
| MAN-05 | Cancelar una visita; recargar; reservar el mismo hueco | Original visible Cancelada y nueva Programada sin conflicto con ella |
| MAN-06 | Filtrar por técnico, fecha y ambos; limpiar filtros y probar una combinación vacía | Coincidencias correctas, orden fecha/hora y mensaje de resultado vacío |

Si aparece una fila inválida, falta una cancelada o cambia la fecha al recargar, se registrará como fallo. Para repetir se cancelarán únicamente las visitas de prueba pertinentes o se usará otra fecha controlada; no se borrarán datos sin necesidad.

Las validaciones manuales seguirán pendientes hasta que confirmes haberlas realizado.

## 11. Documentación y control de avance

Tras aprobar el plan se crearán en el proyecto:

- `docs/PLAN.md`: fases, dependencias y estados; tomará este documento como punto de partida aprobado.
- `docs/REQUISITOS.md`: requisito → implementación → pruebas → resultado → limitaciones.
- `docs/PRUEBAS.md`: casos previstos y resultados reales; separará lo diseñado de lo ejecutado.
- `docs/DIARIO_DESARROLLO.md`: registro cronológico de hitos, decisiones, fallos, correcciones y uso de IA.
- `docs/ESTADO_PROYECTO.md`: estado actual, cómo ejecutar, bloqueos, decisiones pendientes y siguiente acción exacta.
- `docs/RESUMEN_TECNICO.md`: explicación de entrega, máximo una página.
- `README.md`: instalación, configuración, migración, semilla, ejecución y pruebas.

Los estados distinguirán pendiente, en desarrollo, implementado sin verificar, pruebas fallidas, verificado automáticamente, pendiente de validación manual, validado y bloqueado. No se duplicarán explicaciones largas entre documentos.

El registro de IA conservará un caso real con propuesta inicial, problema, evidencia, corrección y resultado. Nunca se introducirá un fallo deliberado para cumplir el apartado; si aún no hay un caso documentado, EN-04 seguirá pendiente y se revisará el trabajo auténtico.

Las actualizaciones al usuario explicarán fase, objetivo, cambios, pruebas, incidencias, prueba manual y siguiente paso. Una funcionalidad no se dará por finalizada por compilar.

## 12. Riesgos y decisiones pendientes

| Asunto | Propuesta |
|---|---|
| Dos días y alcance amplio | Núcleo primero, revisión a las 2–3 horas, entrega preparada antes de opcionales |
| Base no disponible | Aprobar Neon Free o preparar PostgreSQL local con permiso |
| Fechas y desplazamientos | Aprobar los supuestos de la sección 4 antes de implementar |
| Reservas simultáneas | Transacción y bloqueo por técnico, con integración concurrente real |
| Dependencias y Node | Fijar versiones compatibles al inicializar; comprobar build; consultar si hace falta modificar instalación global |
| Arranque de otra persona | README con prerrequisitos explícitos y ensayo limpio cronometrado |
| Publicación de secretos o datos personales | Variables privadas y revisión del contenido e historial antes de publicar |
| Corrección real de IA | Registrar durante el proceso, sin inventar evidencia |
| Servicios gratuitos | Mantener Free, revisar condiciones al activar, no aceptar upgrades o facturación |

La aprobación inicial debe confirmar alcance, arquitectura, carpeta y supuestos. La elección de Neon requiere autorización expresa para ese servicio; también puede decidirse por separado antes de la fase 2.2.

Se solicitará aprobación posterior para publicar el repositorio, desplegar, empezar la mejora de horarios o alterar decisiones principales. Las microtareas ordinarias dentro del plan aprobado podrán continuar sin consultas repetitivas. Las validaciones que necesiten tu participación se marcarán como pendientes.

## 13. Primer bloque después de tu confirmación

1. Registrar exactamente qué has aprobado y cualquier ajuste al plan.
2. Crear la carpeta aislada propuesta y comprobar que el repositorio queda limitado a ella.
3. Inicializar Next.js, TypeScript y Tailwind con npm y dependencias locales.
4. Preparar exclusión de secretos, variables de ejemplo, comprobaciones y seguimiento documental.
5. Arrancar, comprobar tipos, lint y compilación inicial; registrar los resultados reales.
6. Mostrarte cómo abrir esa base de la aplicación y preparar un primer commit local.
7. Pasar a esquema, migraciones y datos cuando esté autorizado y disponible PostgreSQL.

Resultado esperado de ese primer bloque: un proyecto que arranca, una estructura comprensible y una base de trabajo verificable. Todavía no se declarará implementada ninguna regla de planificación.

**Plan aprobado. Consultar ESTADO_PROYECTO.md para el punto actual.**
