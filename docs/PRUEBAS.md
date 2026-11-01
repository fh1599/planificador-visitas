# Pruebas y resultados

Ejecuciones: 30/10–01/11/2026, macOS arm64, Node 26.10.0, npm 11.19.1 y PostgreSQL 18 en Neon Free. Casos originales en PLAN.md (§9–10) y ampliaciones en PLAN_AMPLIACION.md. La tabla inicial refleja el estado actual; los apartados históricos conservan las cifras de cada hito.

## Batería automática

| Comando | Resultado |
|---|---|
| `npm test` | **107 pruebas superadas**, 11 archivos; última ejecución tras los ajustes de interacción de fase 7. |
| `npm run test:integration` | **47 pruebas superadas**, PostgreSQL real, actualización de esquema y concurrencia. Última ejecución completa en fase 6: 91,94 s; reglas y escrituras sin cambios desde entonces. |
| `npm run test:http` | Flujo completo correcto contra Next compilado auxiliar y base aislada; las ocho ampliaciones, persistencia y rechazos comprobados. |
| `npm run typecheck` | Sin errores. |
| `npm run lint` | Sin errores ni avisos. |
| `npm run build` | Producción compilada correctamente; página y endpoints dinámicos. |
| `npm run db:generate` | Migración generada; repetición sin cambios de esquema. |
| `npm audit --omit=dev` | Cero vulnerabilidades conocidas en la consulta del 01/11/2026. |
| `npm audit` | Un aviso moderado de minimatch propagado a 18 paquetes de desarrollo; 0 altos/críticos. Pendiente compatible, documentado en SEGURIDAD.md. |

### Cobertura relevante

- UNIT-01/02: campos, IDs, fechas imposibles, horas, duración cero/negativa/fraccionaria, 07:59/08:00 y final 17:00/17:01.
- UNIT-03/04: solapamiento parcial, contenido, envolvente, mismo inicio, consecutivas en la misma obra y técnicos distintos.
- UNIT-05/06/07: separación inferior/exacta/superior a 30 min; visita anterior y posterior; inserción entre ambas; otras fechas y canceladas que no bloquean.
- INT-01: migración y semilla repetibles; restricciones de duración, jornada y referencias. La primera migración se aplicó a bases nuevas durante la preparación.
- INT-02/03: creación persistente, peticiones HTTP directas inválidas, JSON malformado, referencias inexistentes y otro origen.
- INT-04/05: cancelación con fila conservada y horario libre, cancelación repetida, inexistente, orden y filtros individuales/combinados.
- INT-06: dos conexiones independientes intentan simultáneamente solaparse o dejar solo 15 min entre obras: solo una reserva se confirma. Técnicos diferentes pueden coincidir.
- REG-001: origen externo `127.0.0.1` con URL interna `localhost`; aceptación correcta y rechazo de host/puerto/protocolo distintos u origen `null`.

Integración exige una conexión separada cuyo nombre termine en `_test` y sea distinto del de la base principal. Borra visitas, tipos, bloqueos y sus registros asociados entre casos y al terminar. No ejecutar sobre datos que deban conservarse.

## Navegador: comprobaciones históricas del núcleo por el agente

No es una validación manual del usuario. Navegador integrado, aplicación real y base `visitas`.

| Escenario | Resultado observado |
|---|---|
| Carlos, Can Roca, 09:00–10:00 | Guardado y visible. |
| Otro inicio simultáneo para Carlos | Rechazo por solapamiento, sin fila nueva. |
| Carlos, Centro Cívico, 10:15–11:15 | Rechazo por margen de solo 15 min. |
| Carlos, Centro Cívico, 10:30–11:30 | Guardado con margen exacto de 30 min. |
| Cancelar primera visita y recargar | Fila conservada como Cancelada. |
| Reutilizar Carlos/Can Roca, 09:00–10:00 | Nueva Programada; original Cancelada visible. |
| Laura, Edificio del Parc, 09:00–10:00 | Guardado pese a coincidir con Carlos. |
| Filtros Laura + fecha / Ana + fecha | Una coincidencia correcta / estado vacío. |
| Marc 16:30, duración 31 / 30 | Rechazo por final 17:01 / aceptación a las 17:00. |
| Limpiar filtros | Cinco filas ordenadas: cuatro Programadas y una Cancelada. |
| `npm start` después del build | Agenda cargada desde PostgreSQL; 09:30–10:30 rechazado por solaparse con 09:00–10:00. Datos conservados. |

Revisión visual de escritorio realizada. Adaptación CSS móvil implementada; inspección visual con tamaño móvil pendiente. La captura anterior corresponde al núcleo, no a la interfaz ampliada actual.

## ENT-01: ensayo histórico del núcleo desde copia limpia

Copia sin `node_modules`, `.next`, Git ni credenciales compartidas. Caché npm inicialmente vacía. Se configuró privadamente la base de pruebas, que ya tenía esquema: este ensayo comprueba repetibilidad de migraciones y semilla. La migración sobre base vacía se comprobó en la preparación inicial, no se confunde con este ensayo.

| Paso cronometrado | Tiempo |
|---|---:|
| `npm ci` | 10,62 s |
| `npm run db:migrate` | 1,37 s |
| `npm run db:seed` | 1,17 s |
| `npm run dev -- --port 3001` y primera página HTTP 200 | 5,50 s |
| **Total de comandos** | **18,66 s** |

Node, npm, red y PostgreSQL ya estaban disponibles. No se cronometra alta de cuenta, instalación de Node, copia del código ni edición manual de la variable. Respalda el objetivo de menos de diez minutos con prerrequisitos listos; no garantiza tiempos de red en otro equipo. Servidor auxiliar detenido tras verificarlo.

## ENT-02/04: entrega

Revisión de archivos de Git y ZIP antes de empaquetar: conexiones privadas, dependencias, compilados, documentos originales y registros temporales deben quedar fuera. El resumen de una página explica REG-001. El cierre de estas comprobaciones queda registrado en el diario.

## Validación personal pendiente

MAN-01 está parcialmente confirmado (creación, 01/11/2026); el resto de MAN-01–06 sigue **pendiente de confirmación del usuario**: crear/recargar, solapamiento, desplazamiento 15/30, jornada, cancelar/reutilizar y filtrar. Utilizar una fecha libre, por ejemplo 02/11/2026, para no interferir con los ejemplos del 30/10/2026. Las pruebas del agente no se atribuyen al usuario.

## 01/11/2026 — REG-002, servidor detenido y errores de conexión

El usuario informó de `Failed to fetch`. Una comprobación de conexión al puerto 3000 devolvió ECONNREFUSED: el servidor local estaba detenido, aunque la página seguía abierta. Se restableció la ejecución local; no se atribuyó el fallo a PostgreSQL ni a las reglas.

Se extrajo la petición del cliente a `src/client/api.ts` y se añadieron ocho casos antes de corregirla. Resultado inicial: cinco fallos y 74 aciertos. Después: **79 aciertos**. Se comprueban fallo de conexión, respuesta interrumpida/no JSON, ausencia de mensaje HTTP, conservación de errores de reglas/servicio y respuesta válida. Una escritura no se reintenta automáticamente cuando se desconoce su resultado.

Además, el 01/11/2026 se llamó al servidor Next real por HTTP con el origen local: creación 201, consulta posterior que recuperó la fila, rechazo de duplicado 409 y cancelación 200 conservando la fila. Fixture: Ana Torres, Nave Industrial Can Jardí, 08:00–08:15 del 01/11/2026, ID 6, conservada Cancelada. No se tocaron visitas del usuario. Las 21 pruebas de integración con base separada volvieron a pasar; tipos y lint correctos. La compilación de producción terminó correctamente y el servidor se reinició con esa versión.

Límite de esta ejecución: la herramienta de navegador rechazó acceder a la pestaña por su política de acceso. No se eludió ese bloqueo ni se declara verificada visualmente la nueva pantalla. Se solicita al usuario recargar y confirmar el flujo visible con el servidor restablecido.

Confirmación personal recibida el 01/11/2026: el usuario indicó que la visita ya se guarda correctamente tras recargar. Confirma el flujo de creación de la versión corregida; no se extiende a los demás escenarios manuales.

## Diseño de pruebas de ampliación

Los casos de AM-01–08 y las interacciones con el núcleo se definen antes de implementarlos en PLAN_AMPLIACION.md, fases 0–8 y matriz de interacciones. En aquel momento eran pruebas previstas; los resultados de ejecución constan en los hitos siguientes. La confirmación del usuario se registra por escenario.

Fase 0 de ampliación, 01/11/2026: se repitieron 79 unitarias, TypeScript y lint, todos correctos. Integración falló al preparar la suite por conexión sin permiso de red (21 casos no ejecutados). Tras restablecer el permiso, las 21 pruebas de integración pasaron en 19,86 s. La base de la aplicación no se modificó.

## Ampliación — hito 1, 01/11/2026

83 unitarias y 26 integraciones PostgreSQL correctas, más tipos/lint/build. Nuevas pruebas AM-05/06/07: ficha vacía/teléfono/límites, anotación como texto, tipos inválidos/desactivados, duración manual, copia de instrucciones, conservación tras cancelación y API. Ensayo de actualización: SQL original con visitas programadas/canceladas en esquema aislado de *_test, aplicación de las migraciones siguientes y comparación de IDs, referencias, fecha, horas, estado y creación. Conexión de prueba protegida antes de toda escritura destructiva. La comprobación HTTP de la versión compilada no sustituye la revisión visual, pendiente.

## Ampliación — hito 2, 01/11/2026

90 unitarias y 31 integraciones correctas, más tipos/lint/build. Incluye bordes, contención y cruce de bloqueos, días/rangos, otro técnico, retirados, viajes de 29/30 minutos y fragmentos discontinuos; API de crear/retirar bloqueo; visitas canceladas; bloqueo que invalida reservas; identificación de visitas afectadas sin incluir otras; carrera bloqueo/reserva con conexiones independientes. Migración 0002 aplicada y página/API de bloqueos responden HTTP 200 en el servidor compilado. Revisión visual sigue pendiente.

## Ampliación — hito 3, 01/11/2026

91 unitarias correctas. Integración completa de 38 casos correcta; tras añadir dos casos, ejecución focalizada AM-02: 9 correctos y 31 omitidos, total de casos disponibles 40. Reprogramación: propio ID, notas, historial, fallo conserva original, nueva fecha/técnico, jornada completa, versiones concurrentes, cancelación concurrente, reserva concurrente, cambios cruzados de técnico, HTTP sin versión/obsoleto y cancelación idempotente. Tipos/lint/build correctos; HTTP de consultas con versión e historial correcto. Revisión visual pendiente.

## Ampliación — hito 4, 01/11/2026

96 unitarias y 43 integraciones PostgreSQL correctas. Tipos, lint y build correctos. POST HTTP real de sugerencias devuelve tres opciones sin escribir visitas. Se verifica minuto exacto, extremo de jornada, huecos agrupados, técnico/equipo, bloqueos, canceladas, no disponibilidad y revalidación de una propuesta ocupada entre consulta y reserva. Revisión visual pendiente.

## Ampliación — hito 5, 01/11/2026

101 unitarias correctas (9 archivos); tipos/lint/build correctos. Agenda: coordenadas 08:00/17:00/un minuto, filtros, canceladas, bloqueos, tramo real de viaje y fechas estacionales. Renderizado SSR comprueba etiquetas y texto HTML escapado; HTTP de página compilada devuelve cuatro columnas y ambas vistas. Integración más reciente: 43 correctas (fase 4, sin cambios nuevos en reglas/escrituras). No se declara realizada la inspección visual ni la interacción con teclado/móvil.

## Ampliación — hito 6, 01/11/2026

107 unitarias + 47 integraciones completas correctas; tipos/lint/build correctos. Avisos: ventana exacta con milisegundos, Madrid invierno/verano/cambios estacionales, cancelación/reprogramación/cambio de técnico, lectura corrupta y repetida, límite de almacenamiento, apertura/foco/visibilidad/intervalo, caída y recuperación, no duplicar consultas en vuelo y limpieza al desmontar. Persistencia: eventos solo de cambios confirmados, retirada de bloqueo idempotente, filtro de actividad antigua y respuesta sin caché con hora del servidor. Flujo combinado tipo → propuesta → reserva → incidencia → reprogramación → aviso → cancelación, con referencias y notas conservadas. Migración 0004 aplicada y API compilada de avisos responde HTTP 200.

Validación personal: el usuario confirmó que la agenda diaria se ve bien y al pulsar una visita abre el detalle. Esta confirmación no se extiende a móvil, teclado ni al resto de escrituras ampliadas.

## Ampliación — comprobación HTTP de producción

`npm run test:http` correcto tras compilar la fase 7. Un proceso auxiliar Next, con puerto propio verificado y DATABASE_URL de *_test, recibió peticiones HTTP reales con Origin/Host. Recorrió las ocho funciones y los rechazos de versión obsoleta, bloqueo y solapamiento; comprobó notas/historial tras cancelar, reutilización y avisos. Limpieza de fixtures realizada. No se modificó ninguna visita del usuario. 107 unitarias, tipos/lint/build y diff correctos después de ajustes de interacción. Última integración completa: 47 correctas en fase 6; las reglas/escrituras no han cambiado desde esa ejecución.

## ENT-01 ampliado: instalación limpia y repetibilidad

Versión ampliada, código funcional de fase 7. Copia sin dependencias, compilados ni Git y caché npm inicialmente vacía. La conexión se configuró solo en la copia privada contra la base de pruebas, que ya tenía el esquema: este ensayo comprueba instalación limpia del código e idempotencia de migraciones/semilla, no una base vacía. El ensayo de actualización desde el esquema original pertenece a integración; las bases vacías se migraron al preparar el núcleo.

| Paso | Tiempo |
|---|---:|
| Instalación con `npm ci` | 7,26 s |
| Migraciones | 1,05 s |
| Semilla | 1,24 s |
| Arranque de desarrollo y primera página HTTP 200 | 4,75 s |
| **Total** | **14,30 s** |

Node, npm, red y PostgreSQL estaban disponibles. Se excluyen alta del proveedor, instalación de Node y preparación manual de la conexión; el tiempo no es una garantía para otras redes/equipos. Se detuvo el auxiliar y se eliminaron copia temporal y caché de ensayo; no se modificaron datos del usuario.

## Cierre local y límites de aceptación

La documentación y el resumen se actualizan para las ocho ampliaciones. Se revisan los archivos versionados, historial y ZIP buscando valores privados conocidos y patrones de credenciales. El paquete se genera desde un commit local; el manifiesto externo de entrega identifica commit, archivos y sumas SHA-256. El PDF se renderiza e inspecciona y debe conservar una página.

La auditoría de dependencias se registra con su resultado actual en SEGURIDAD.md; el resultado histórico de cero avisos del núcleo no describe la consulta más reciente. No se cambian dependencias durante este cierre documental.

Quedan pendientes interacción real de móvil/teclado y confirmación personal del resto de acciones ampliadas. La confirmación recibida cubre creación, apariencia de agenda y apertura de detalle. La herramienta de navegador bloqueó el acceso; HTTP y SSR no prueban foco real, disposición móvil ni clics en todos los formularios. GitHub público y el despliegue opcional siguen pendientes de sus decisiones de publicación.
