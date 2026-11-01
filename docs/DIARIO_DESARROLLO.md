# Diario de desarrollo

## 30/10/2026 — Fases 0 y 1

Se leyeron el PDF original y la propuesta de trabajo. Se distinguieron requisitos de Talent Clau, decisiones propias y opcionales. Se comprobó el entorno y se propuso arquitectura y pruebas. El usuario informó de dos días restantes y aprobó el plan completo y Neon Free expresamente.

## 30/10/2026 — Fase 2.1, inicio y recuperación

La sesión anterior se interrumpió antes de crear el proyecto. Al retomar se comprobó que solo existía el plan y no se reinició trabajo ya realizado. La lista de procesos está restringida por el entorno; no se presentó como comprobación superada.

Se crea una carpeta propia y repositorio Git local, estructura Next.js/TypeScript/Tailwind, configuración de comprobaciones y exclusión de secretos. Se conserva el plan aprobado en docs/PLAN.md. Se solicita el acceso de red necesario para instalar dependencias locales. No se instala software global ni se publica.

Criterio de aceptación del bloque: arranque local, compilación, tipos y lint correctos. Resultados: pendientes. Uso de IA: propuesta y preparación de la estructura; no hay todavía una corrección verificada que presentar como evidencia final.

Incidencia de instalación: npm no pudo escribir en la caché personal (`EPERM`). El mensaje genérico sugirió cambiar permisos globales, pero no se ha modificado el sistema: la instalación se reintenta con caché dentro de `work/` del espacio autorizado. La causa exacta de propiedad de la caché no se ha verificado; la restricción de escritura sí se observó. Esto es una incidencia de entorno, no un fallo funcional de la aplicación.

Se descubrió el plugin Neon disponible pero no instalado y se ofreció su conexión. Mientras se resuelve ese acceso se continúa con estructura, reglas y pruebas independientes.

## 30/10/2026 — Dominio, esquema y acceso a Neon

Se escribieron pruebas antes del dominio: primero falló la importación de módulos inexistentes y después pasaron 66 casos. Se implementó validación de entrada, fechas civiles, intervalos con final excluido y desplazamientos en ambos sentidos. Compilación inicial y TypeScript correctos. Se generó una migración SQL con claves foráneas y restricciones de jornada/duración.

Neon está accesible y su consola confirma Free Plan, 0 $/mes. Primer intento de creación rechazado (HTTP 412) por especificar el tiempo de suspensión, incluso usando 300 segundos. Se confirmó en la consola que no se había creado ningún proyecto. Se reintenta sin modificar ese ajuste para respetar el valor del plan gratuito. Esta corrección de configuración fue propuesta y ejecutada por IA; falta verificar el resultado del nuevo intento.

## 30/10/2026 — Servidor, interfaz y corrección de IA

Se implementaron creación y cancelación transaccionales, consultas con filtros, endpoints de servidor y la interfaz. Las escrituras bloquean la fila del técnico antes de consultar la disponibilidad. La cancelación conserva el registro. La pantalla incluye tabla, formulario, filtros, estados de carga, mensajes y confirmación de cancelación.

Corrección real del código generado por IA: la primera versión de `src/app/page.tsx` construía el componente de interfaz dentro de un `try/catch`. ESLint (`react-hooks/error-boundaries`) detectó que ese bloque no captura errores de renderizado diferido de React. Se separó la carga de datos en `loadAgenda`, que captura únicamente errores de conexión/consulta, y se dejó el JSX fuera del bloque. También se cambió el enlace interno de marca a `Link` y el reintento a un formulario GET. Se vuelve a ejecutar tipos y lint para verificar la corrección.

Incidencias del entorno: Turbopack no pudo abrir el observador FSEvent. Se cambió el comando local a Webpack con sondeo de archivos y se comprobó HTTP 200. El comando CLI de tsx falló al crear un socket IPC; `node --import tsx` permitió ejecutar el script. Posteriormente la red no estaba disponible tras una nueva reanudación: tanto npm como Neon fallaban al resolver DNS; se solicitó restablecer el permiso de red, que era de alcance de turno. No se atribuye ese fallo a Neon ni se declara aplicada todavía la migración.

Neon: bases `visitas` y `visitas_test`, PostgreSQL 18 en Frankfurt. Free confirmado en consola. Conexiones guardadas en `.env.local` con permisos de archivo privados y excluidas de Git. No se publican credenciales ni se copian al diario.

## 30/10/2026 — Persistencia y cierre del núcleo

La creación de Neon sin alterar la suspensión terminó correctamente. Migración y semilla aplicadas en `visitas`; se preparó `visitas_test` por separado. Las 21 pruebas de integración superaron restricciones SQL, peticiones inválidas, cancelación, filtros y concurrencia de dos conexiones. Tipos, lint y compilación finales correctos; queda verificada también la corrección de JSX descrita anteriormente.

La auditoría npm mostró cuatro avisos moderados transitivos de esbuild en herramientas de desarrollo. Se fijó la versión 0.25.12 para `@esbuild-kit/core-utils` mediante override; instalación y auditorías completa/producción terminaron con cero vulnerabilidades conocidas. Se volvió a comprobar generación de migraciones, integración y build; no se aplicó `audit fix --force` ni una actualización global.

## 30/10/2026 — REG-001: error real de IA descubierto en navegador

La primera creación desde `http://127.0.0.1:3000` devolvió HTTP 403. La validación generada comparaba Origin directamente con `new URL(request.url).origin`. Next normalizaba su URL interna a `localhost`, aunque la petición legítima llegaba desde `127.0.0.1`. Las pruebas HTTP originales construían Requests sin reproducir esa diferencia y no detectaban el defecto.

Se añadió primero la regresión con URL interna localhost, Host 127.0.0.1 y Origin 127.0.0.1: resultado observado, un fallo y 70 aciertos. Se corrigió la comparación usando Host para reconstruir la dirección solicitada, conservando el protocolo. Se retiró la instrumentación temporal. Resultado: 71 aciertos, incluidos rechazos de otro host, puerto, protocolo y origen null; 21 de integración y compilación correctas después.

El navegador confirmó creación, rechazo por solapamiento y margen de 15 min, aceptación de 30 min, cancelación persistente, reutilización, técnicos simultáneos, filtros/vacío y límites 17:00/17:01. Se conservan cinco reservas ficticias como demostración. Esta es evidencia del agente, no confirmación manual del usuario.

## 30/10/2026 — Ejecución reproducible y documentación

Desde copia sin dependencias ni compilados, con caché npm inicialmente vacía: npm ci 10,62 s; migración 1,37 s; semilla 1,17 s; arranque y primera página con PostgreSQL 5,50 s. Total: 18,66 s. Prerrequisitos y conexión disponibles; la base tenía esquema, por lo que se verificó idempotencia. La migración inicial sobre bases nuevas había sido comprobada antes. Se detuvo el servidor auxiliar.

Se actualizan README, matriz, estado y pruebas, y se prepara el resumen de una página. Se retiran citas de conversaciones y rutas personales del contenido publicable. GitHub, despliegue, sugerencias y validación personal continúan pendientes según el plan.

## 31/10/2026 — Preparación de entrega para validación

Se recuperó el resultado pendiente en producción: una visita 09:30–10:30 para Carlos fue rechazada por solaparse con 09:00–10:00, sin nueva fila. Se repitieron las 71 unitarias después de la reanudación, todas correctas. El resumen de 405 palabras se exportó y se verificó visualmente como un PDF de una página. El renderizado necesitó configuración local de Fontconfig y una caché en el directorio de trabajo; no se cambiaron fuentes ni configuración global del Mac.

Se guardó una captura del historial, se preparó el guion de validación personal y se actualizó la auditoría. No se atribuye ninguna prueba manual al usuario ni se da por publicado el repositorio.

Revisión ENT-02: 41 archivos de entrega inspeccionados, sin coincidencias con las conexiones/contraseña privadas ni patrones de claves; `.env.local` ignorado por Git. No se incluyen rutas personales, dependencias, compilados ni los documentos originales. El PDF revisado contiene una sola página. Se prepara un único commit del hito completo: las fases anteriores no se guardaron en commits separados y no se reconstruye un historial ficticio.

## 01/11/2026 — Incidencia comunicada por el usuario y REG-002

El usuario encontró «Failed to fetch» al programar. Se confirmó que el puerto 3000 no tenía servidor escuchando. El proceso de comprobación había sido detenido al cerrar el trabajo anterior, dejando la pestaña disponible pero sin servicio. Se reconoció el problema de entrega y se explicitó que la versión local necesita mantener el servidor en marcha. Esto no invalida las pruebas previas, pero descubre un caso de uso no cubierto por ellas.

El primer reinicio fue bloqueado por EPERM en el puerto local. Se solicitó el permiso de red del entorno y el usuario lo concedió; el servidor arrancó. La herramienta de navegador rechazó observar la pestaña por política de acceso. Se continuó con pruebas de código y HTTP sin intentar eludir el bloqueo; la comprobación visual actual se deja pendiente.

Se aisló la función de petición del cliente, conservando inicialmente su comportamiento, y se escribieron ocho regresiones. Cinco fallaron (mensajes crudos de red/respuesta ilegible y error HTTP sin cuerpo de error) y 74 pasaron. Tras la corrección, las 79 unitarias y las 21 de integración pasaron, al igual que tipos y lint. Ahora se explica la falta de respuesta en español, no se afirma que una escritura incierta no se guardó, se recomienda actualizar antes de repetirla y no se reenvían escrituras automáticamente.

Por HTTP contra Next y la base principal se creó una visita ficticia propia, se consultó su persistencia, se rechazó el solapamiento y se canceló conservando el registro. No se modificaron visitas del usuario. Se actualizan instrucciones de arranque, pruebas, estado y entregables. La ejecución local se restablece para la validación en curso; no se presenta como un despliegue permanente.

La compilación de producción terminó correctamente. El usuario recargó y confirmó que la visita ya se guarda. Se registra únicamente esa comprobación personal, manteniendo pendiente el resto del guion. La ejecución local queda activa para continuar la validación; no sustituye mantener el servidor en marcha en usos posteriores.

## 01/11/2026 — Alcance de ampliación y planificación

El usuario seleccionó ocho mejoras y cerró la incorporación de nuevas funciones: búsqueda, reprogramación, agenda visual, bloqueos, fichas de obra, seguimiento opcional, tipos sin sobrecargar el formulario y avisos. Confirmó que los avisos serán dentro de la aplicación. Se inspeccionó el estado del repositorio (f486047, limpio) y se preparó PLAN_AMPLIACION.md con fases/subfases, decisiones propuestas, aceptación y pruebas cruzadas. No se alteraron funcionalidades, datos ni servicios al preparar el plan. La batería de base registrada no se presenta como una nueva ejecución.

Se ejecutó la fase 0.3: 79 unitarias, tipos y lint correctos. La primera integración quedó sin ejecutar por resolución de red restringida; se renovó el permiso del turno y la repetición pasó las 21 pruebas. Se deja una referencia comprobada para la ampliación. El siguiente bloque comienza por el diseño de interacción y los casos de migración; aún no hay cambios funcionales.

## 01/11/2026 — Ampliación, fase 1

Tras el «adelante» del usuario se implementan fichas operativas, tipos opcionales y anotaciones. La interfaz conserva los cinco campos de creación; «Usar un tipo» está plegado, «Obras y tipos» gestiona catálogos y pulsar una obra en el listado abre el detalle. Las notas son opcionales y no cambian el estado de la visita. Nombre e indicaciones del tipo se copian al reservar para conservar el contexto histórico; la duración explícita de la visita prevalece.

Se escribieron primero los casos de entrada (79 pruebas anteriores correctas y suite nueva sin módulo, fallo esperado). Después: 83 unitarias y 26 integraciones correctas; estas últimas incluyen rutas nuevas, actualización real desde la migración original en un esquema aislado de visitas_test, conservación de filas y desactivación de tipos. Tipos, lint y compilación correctos. Se aplica la migración aditiva 0001 en la base principal y se reinicia el servidor de producción. Consulta HTTP de página y catálogos comprobada; la revisión visual sigue pendiente por la restricción previa de acceso del navegador. No se han modificado reservas del usuario.

## 01/11/2026 — Ampliación, fase 2

Se diseñaron primero los casos de bloqueos y se implementaron franjas diarias y rangos inclusivos de días. Jornada completa es 08:00–17:00. Los bloqueos se retiran conservando el registro; no se solapan entre sí. Crear un bloqueo valida todas las visitas afectadas y sus desplazamientos; los mensajes identifican visitas concretas. Los viajes necesitan un tramo libre continuo de 30 minutos y las ausencias no cuentan como disponibilidad. Solo se revisan los pares de visitas contiguas involucrados, para no señalar visitas ajenas a un conflicto.

Las operaciones de bloqueo y reserva comparten el bloqueo de fila del técnico; la prueba con conexiones independientes solo permite confirmar una operación incompatible. Se añadió el panel «Disponibilidad» con fechas, día completo, motivo opcional y confirmación de retirada. Tras reanudar el chat, la integración encontró ENOTFOUND por caducidad del permiso de red; se renovó antes de repetirla. No fue un fallo funcional. Evidencia y resultado final del hito en PRUEBAS.md.

## 01/11/2026 — Ampliación, fase 3

Reprogramación con PUT, misma identidad y anotaciones conservadas. El servidor bloquea primero la visita y luego los técnicos en orden de ID; valida estado, versión, obra, jornada, reservas y bloqueos antes de actualizar. Los cambios nulos no incrementan versión ni generan historial. La cancelación sigue siendo idempotente y admite la versión opcional para compatibilidad con la API original; la interfaz sí envía versión al cancelar. Un cambio fallido no modifica ni libera la visita anterior.

Casos de integración escritos antes de la función: se observó el fallo «reschedule is not a function». Tras implementar, ejecución completa de 38 integraciones correcta; se añadieron API con versión y cambios cruzados de técnico, pasando después los nueve casos AM-02 (31 restantes omitidos en esa ejecución focalizada). 91 unitarias, tipos, lint y build correctos. Migración 0003 aplicada; lectura HTTP confirma versiones e historial. El formulario precargado y la cronología se integran en el detalle. Comprobación visual/personal pendiente.

## 01/11/2026 — Ampliación, fase 4

Búsqueda de huecos con la misma regla pura que crear/reprogramar. Escanea cada minuto de la jornada y agrupa inicios consecutivos válidos; ofrece una opción cercana a la hora preferida por hueco y técnico, hasta tres. Así se evitan alternativas redundantes separadas por un minuto sin imponer redondeos. Consulta una instantánea coherente de PostgreSQL en transacción de solo lectura; no reserva. El panel «Buscar un horario libre» permite técnico concreto/equipo y aplica la propuesta al formulario controlado, requiriendo confirmación posterior. Si otra reserva ocupa el hueco, la creación vuelve a validarlo y lo rechaza.

Se escribieron primero los casos unitarios y se observó la ausencia del módulo. Después pasan 96 unitarias, incluidas propiedades de validez de todas las propuestas, minuto exacto, agenda llena, duración completa y traslado. Se añadieron tres integraciones con API: consulta sin escritura, opción obsoleta, equipo bloqueado, reservas resultantes válidas y entradas inválidas. Tipos/lint correctos. Resultado de la ejecución completa y build en PRUEBAS.md.

## 01/11/2026 — Ampliación, fase 5

Agenda diaria con columnas de los cuatro técnicos, escala 08:00–17:00 y distinción de visita/bloqueo/desplazamiento. Los desplazamientos usan el mismo cálculo de disponibilidad continua que el servidor. Cambiar a listado conserva consulta y filtros; limpiar fecha muestra listado, y anterior/hoy/siguiente aplican una fecha civil sin conversión local. Tras cada escritura se recargan visitas y bloqueos antes de sustituir la consulta visible. Desde ambas vistas se abre el mismo detalle; se añadió acceso a cancelación con confirmación desde ese detalle.

Las visitas cortas conservan su duración a escala y tienen botones adicionales de acceso. El tablero permite desplazamiento horizontal con teclado. Se escribieron casos antes del módulo: posiciones/extremos, filtro, canceladas, viaje interrumpido y fechas estacionales. Prueba de renderizado SSR comprueba escape de texto, etiqueta accesible y acceso a visita de un minuto; no equivale a interacción en navegador. 101 unitarias, tipos/lint/build correctos. Regresión de integración más reciente: 43 correctas en fase 4; esta fase no modifica reglas ni escrituras de servidor. HTTP de página compilada confirma las cuatro columnas. Inspección visual real y teclado pendientes debido al bloqueo de herramienta ya registrado.

## 01/11/2026 — Validación personal de la agenda ampliada

El usuario confirmó «Se ve bien y el detalle abre» tras la pregunta sobre la agenda diaria y pulsar una visita. Se registra esa comprobación visual y de apertura. No se infieren pruebas personales de reprogramación, anotaciones, bloqueos, avisos, móvil o teclado.

## 01/11/2026 — Ampliación, fase 6

Avisos internos para próximas visitas y actividad compartida de reservas/bloqueos. Los recordatorios se calculan con fecha/hora de Madrid y reloj del servidor, desde 30 minutos antes hasta el instante del inicio. Su clave incorpora la versión: cancelar o reprogramar invalida la anterior. La actividad muestra hasta 50 cambios de siete días; los historiales de visitas permanecen completos. Crear o retirar bloqueo genera evento en la misma transacción, con retirada idempotente. Los eventos usan clock_timestamp() para reflejar cuándo se registran tras esperar bloqueos; el historial de visita se ordena por secuencia de inserción.

El cliente consulta cada 30 segundos solo con la página visible, al abrir y recuperar el foco. Evita peticiones en vuelo duplicadas, aborta al desmontar y recupera lecturas tras una caída. Oculta recordatorios si falla la actualización y señala que la actividad pertenece a la última consulta. Lectura persistente por navegador, sincronizada entre sus pestañas; si el almacenamiento falla se conserva la lectura de sesión y se informa. No hay correo, push con la aplicación cerrada ni cuentas individuales.

Los tests de reloj, cambios estacionales, invalidación, claves de lectura y actualización visible se prepararon durante el diseño. Un fallo de tipos en un dato de prueba y una advertencia de lint sobre captura de refs se corrigieron antes de cerrar el bloque; no se desactivaron reglas. 107 unitarias correctas, tipos/lint correctos. Resultado final de integración/build en PRUEBAS.md.

## 01/11/2026 — Ampliación, fases 7 y 8: revisión de uso y HTTP real

Se mantuvo la dirección visual que el usuario confirmó y se ajustaron legibilidad, contraste de textos secundarios, foco visible, tamaños táctiles y campos móviles. El éxito de creación y los avisos de guardado confirmado con fallo de recarga quedan junto al formulario. La revisión de código detectó que el acceso desde la agenda vacía enfocaba el primer select, ahora oculto dentro del tipo opcional; se corrigió para enfocar explícitamente Obra. Son ajustes de interacción, no nuevas reglas.

107 unitarias, tipos/lint/build correctos. Se añadió `npm run test:http`: inicia un Next compilado auxiliar, verifica que su propio proceso enlazó el puerto, usa exclusivamente *_test distinto de la base principal y limpia sus propios registros. El flujo completo pasó: página/cuatro columnas, catálogos, ficha, tipo, bloqueo, búsqueda, reserva, incidencia, reprogramación, versión antigua/solapamiento/bloqueo rechazados, cancelación con notas/historial, reutilización del horario y avisos. La aplicación del usuario permanece en el puerto 3000. Esta prueba HTTP no se presenta como automatización visual ni de teclado. Móvil y teclado siguen pendientes de comprobación real.


## 01/11/2026 — Cierre documental, ensayo limpio y dependencias

La versión ampliada pasó el ensayo desde copia sin dependencias/compilados y caché npm vacía: instalación 7,26 s, migración 1,05 s, semilla 1,24 s, arranque y primera página 4,75 s; total 14,30 s. Node/red/PostgreSQL disponibles. El esquema de prueba ya existía, por lo que se comprueba repetibilidad; la actualización del esquema anterior se verifica por separado en integración. Copia y caché temporales eliminadas; auxiliar detenido, servidor de la aplicación conservado.

La auditoría completa actual muestra un aviso moderado de minimatch propagado a 18 paquetes de desarrollo, sin avisos altos/críticos. La auditoría que omite desarrollo devuelve cero. Se consultaron el aviso primario y las versiones: la corrección indicada es 11.0.1, mientras los consumidores instalados requieren 3.x/10.x y npm no ofrece corrección automática. Se comunica la decisión de conservar el árbol probado y documentar el pendiente compatible; no se oculta el aviso ni se fuerza un salto mayor. Detalle reproducible en SEGURIDAD.md.

Se actualizan README, estado, matriz, plan, pruebas y resumen de una página para reflejar las ocho funciones. Los registros históricos se conservan como tales. La documentación distingue pruebas automáticas/HTTP, confirmación personal recibida y revisión móvil/teclado todavía pendiente. Se prepara paquete desde commit local con inspección de archivos y valores privados; el manifiesto externo registra su identidad. GitHub/despliegue y envío a terceros no se ejecutan en este cierre.
