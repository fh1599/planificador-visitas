# Plan de ampliación del planificador

Fecha: 01/11/2026. Alcance seleccionado por el usuario: ocho funciones. Canal de avisos confirmado: dentro de la aplicación. Este documento define el orden, las decisiones propuestas, los criterios y las pruebas; no declara implementadas las ampliaciones.

## 1. Alcance cerrado y prioridades de uso

| ID | Función elegida | Resultado esperado |
|---|---|---|
| AM-01 | Búsqueda de huecos y alternativas | Encontrar horarios válidos sin probarlos manualmente; aplicar una propuesta y volver a validarla al guardar. |
| AM-02 | Reprogramación | Cambiar una visita de forma atómica, manteniendo la original si el cambio falla. |
| AM-03 | Agenda visual del equipo | Consultar un día con los cuatro técnicos, visitas y bloqueos, junto al listado actual. |
| AM-04 | Bloqueos de disponibilidad | Registrar ausencias por franjas o días completos y tenerlas en cuenta al planificar. |
| AM-05 | Ficha operativa de obra | Consultar y editar dirección, contacto, teléfono e indicaciones de acceso de las obras existentes. |
| AM-06 | Notas, incidencias y resultados | Añadir información opcional desde el detalle de una visita, sin exigirla para programar o cancelar. |
| AM-07 | Tipos de visita | Usar duraciones e indicaciones habituales conservando la programación manual sencilla. |
| AM-08 | Avisos y recordatorios internos | Ver cambios relevantes y próximas visitas dentro de la aplicación. |

Las restricciones originales siguen siendo el contrato de referencia: horario 08:00–17:00, duración entera positiva, solapamientos prohibidos por técnico, 30 minutos entre obras diferentes, cancelación con registro conservado, filtros y orden, validación de servidor y persistencia relacional.

El trabajo se mantiene en la arquitectura existente. No se añaden funciones distintas de las ocho elegidas. La publicación conserva su decisión posterior, tras revisar el resultado.

## 2. Decisiones de diseño propuestas

1. **Formulario sencillo.** Los cinco datos actuales continúan visibles. La opción «Usar un tipo de visita» será opcional y compacta. El tipo propone una duración que se puede ajustar. Contactos, seguimiento e historial se consultan en el detalle, fuera del formulario inicial.
2. **Detalle de visita.** Un panel contextual reúne datos de la obra, reprogramación y seguimiento. Cerrar sin guardar no modifica datos. Se preserva la entrada del usuario ante un error recuperable.
3. **Anotaciones opcionales.** Ninguna visita exige nota, incidencia ni resultado. La información de seguimiento no sustituye Programada/Cancelada ni libera por sí sola un horario. Se muestran como texto, sin ejecutar HTML.
4. **Tipos y datos existentes.** Las visitas anteriores siguen siendo válidas sin tipo. Cambiar la duración predeterminada de un tipo no cambia reservas ya guardadas. Los tipos utilizados se pueden desactivar conservando sus referencias históricas.
5. **Bloqueos.** Impiden reservar una franja indisponible. Un bloqueo que invalida visitas ya programadas se rechaza y muestra las afectadas para que el usuario resuelva la agenda. No se cancelan ni mueven visitas automáticamente.
6. **Desplazamiento y bloqueos.** Un bloqueo no representa una obra ni añade un desplazamiento propio. Entre visitas a obras diferentes debe existir un tramo disponible continuo de al menos 30 minutos; una ausencia no debe contarse como tiempo disponible para viajar. No se calcula tiempo de viaje antes de la primera visita ni después de la última, que el enunciado no define.
7. **Reprogramación atómica.** Se valida el cambio antes de sustituir la planificación. Se excluye la propia visita al comprobar conflictos. Si cambia el técnico, se bloquean ambos técnicos en un orden estable para evitar carreras y bloqueos cruzados. Una edición basada en datos antiguos debe avisar y pedir recargar, no sobrescribir cambios ajenos silenciosamente.
8. **Búsqueda separada de la reserva.** Se ofrecerán hasta tres alternativas para la fecha y duración indicadas, con técnico concreto o consulta del equipo. Se priorizan las horas más próximas a la solicitada, con desempate estable. La búsqueda revisa minutos enteros y no impone saltos de 15/30 minutos. Las propuestas reutilizan las reglas del servidor y no reservan huecos; se validan otra vez al confirmar.
9. **Agenda visual diaria.** Se comienza por un día y los cuatro técnicos. Comparte datos y filtros con el listado. Las acciones abren el mismo detalle y el mismo proceso de reprogramación. Los desplazamientos y bloqueos deben distinguirse de una visita real.
10. **Avisos internos.** Canal confirmado por el usuario. Se propone avisar de próximas visitas en los 30 minutos anteriores y de cambios de planificación. Se actualizan al abrir la aplicación, recuperar el foco y periódicamente mientras está visible. Se elimina el recordatorio obsoleto al cancelar o reprogramar. La aplicación necesita servidor activo; los avisos internos no notifican con la aplicación cerrada.
11. **Lectura de avisos.** Dado que no hay cuentas individuales en el alcance, la información de actividad corresponde a la agenda compartida. La lectura se conserva por navegador, sin atribuirla a un técnico identificado ni prometer sincronización entre dispositivos.
12. **Cambios conservados.** Las migraciones añaden estructura compatible con los registros existentes. Los ensayos de migración y las pruebas destructivas se ejecutan en la base de pruebas; nunca sobre las visitas del usuario.

Estas decisiones se comunicarán al entrar en el bloque correspondiente. Si una comprobación exige cambiar una decisión importante, se explicará el motivo, el impacto y las opciones antes de aplicarla.

## 3. Fases, subfases y aceptación

### Fase 0 — Preparación y protección de la base

- 0.1. Revisar el estado de Git, arquitectura, esquema y pruebas existentes. Referencia actual: commit `f486047`; árbol limpio al inspeccionarlo.
- 0.2. Guardar este alcance, decisiones, dependencias y pruebas previstas; actualizar matriz y estado.
- 0.3. Comprobaciones de base ejecutadas de nuevo el 01/11/2026: 79 unitarias, 21 de integración, TypeScript y lint correctos. La primera integración no pudo conectar por falta del permiso de red del turno; tras restablecerlo, las 21 pruebas pasaron en 19,86 s. No se alteró el código funcional.
- 0.4. Preparar datos ficticios para las combinaciones de nuevas reglas y un ensayo de actualización desde el esquema anterior.

**Aceptación:** contrato original identificado, estado recuperable, pruebas de base correctas o incidencias resueltas antes de continuar. Las comprobaciones manuales anteriores mantienen su alcance real: el usuario confirmó creación, no todos los flujos.

### Fase 1 — Datos operativos y formulario sencillo

- 1.1. Diseñar la distribución y los estados del formulario, detalle y fichas; mostrar las decisiones de interacción antes de programarlos.
- 1.2. Diseñar migraciones para datos de obra, tipos y seguimiento; probar actualización de una base con visitas y cancelaciones previas.
- 1.3. Implementar lectura/edición de fichas de las obras existentes: datos nuevos opcionales y límites de entrada claros.
- 1.4. Implementar tipos de visita y su uso opcional. Copiar el valor propuesto a la visita; no recalcular reservas anteriores al editar un tipo.
- 1.5. Implementar notas, incidencias y resultados opcionales en el detalle; guardar fecha de anotación y vínculo con la visita.
- 1.6. Integrar sin ampliar permanentemente el formulario inicial.

**Pruebas:** entradas vacías válidas cuando el campo es opcional; longitudes/formato; acceso por API; texto potencialmente HTML tratado como texto; visitas antiguas sin tipo; tipo desactivado; duración manual conservada; cambiar un tipo no altera visitas existentes; creación y cancelación sin seguimiento.

**Aceptación:** AM-05/06/07 utilizables; reservas existentes conservadas; el formulario permite seguir creando con el flujo básico actual; esquema/servidor/interfaz coherentes.

### Fase 2 — Bloqueos de disponibilidad

- 2.1. Definir representación de una franja y días completos, límites y mensajes.
- 2.2. Escribir los casos de solapamiento, extremos exactos y desplazamiento interrumpido antes de implementar la regla.
- 2.3. Crear, consultar y retirar bloqueos del técnico con validación de servidor.
- 2.4. Detectar las visitas afectadas por un nuevo bloqueo y explicar el rechazo.
- 2.5. Incorporar bloqueos al camino transaccional de creación de visitas.

**Pruebas:** visita dentro de bloqueo, conteniendo el bloqueo y parcialmente solapada; contacto exacto de extremos; día completo y rango de fechas; otro técnico; retirada de bloqueo; visita cancelada; viaje con 29/30 minutos disponibles; huecos separados que no suman un tramo continuo suficiente; petición simultánea de bloqueo y visita.

**Aceptación:** AM-04 funciona tanto desde la interfaz como mediante peticiones directas. Una carrera no permite guardar un bloqueo incompatible con una reserva activa.

### Fase 3 — Reprogramación segura

- 3.1. Diseñar el formulario precargado y la confirmación del cambio.
- 3.2. Implementar actualización con comprobación de versión y preservación del ID.
- 3.3. Aplicar jornada, solapamientos, desplazamientos y bloqueos; liberar el hueco anterior solo cuando el cambio se confirme.
- 3.4. Registrar qué campos de planificación cambiaron y cuándo, para el detalle y los avisos posteriores.
- 3.5. Integrar cambios de técnico y fecha sin pérdida de notas o datos operativos.

**Pruebas:** cambio válido; cambio que falla y conserva la original; no conflicto consigo misma; cambio de técnico/día; extremos 08:00/17:00; notas conservadas; dos ediciones concurrentes; cancelar mientras se edita; reprogramación y reserva simultáneas sobre el mismo hueco; respuesta perdida sin reenvío automático.

**Aceptación:** AM-02 conserva la coherencia ante errores y concurrencia. La operación de cancelación actual continúa funcionando.

### Fase 4 — Búsqueda de huecos y alternativas

- 4.1. Diseñar la búsqueda como acción separada y como ayuda ante un conflicto.
- 4.2. Implementar un algoritmo determinista con las reglas comunes, fecha y duración solicitadas.
- 4.3. Permitir técnico concreto o equipo y devolver hasta tres propuestas ordenadas, sin duplicados.
- 4.4. Aplicar una propuesta al formulario y pedir confirmación de guardado.
- 4.5. Gestionar que una propuesta deje de estar libre entre consulta y confirmación.

**Pruebas:** agenda vacía/llena, hueco exacto, límites de jornada, duración de un minuto y jornada completa, misma/diferente obra, anterior/posterior, canceladas, bloqueos, ningún técnico disponible y desempates. Cada propuesta debe pasar por el validador completo; una reserva concurrente debe invalidar una propuesta antigua al guardar.

**Aceptación:** AM-01 nunca presenta como válida una alternativa que contradiga los datos consultados. Si ya no está libre al confirmar, se explica y se renueva la búsqueda.

### Fase 5 — Agenda visual del equipo

- 5.1. Diseñar vista diaria, escala horaria y navegación de fechas.
- 5.2. Representar visitas y bloqueos por técnico y permitir abrir el detalle.
- 5.3. Integrar filtros, búsqueda, reprogramación y cambios de estado con el listado existente.
- 5.4. Resolver densidad, textos largos, desplazamiento y uso en pantallas pequeñas.

**Pruebas:** posiciones y duración visual; 08:00/17:00; visitas cortas; técnicos simultáneos; canceladas no ocupando disponibilidad; bloqueos; agenda vacía; cambio de fecha en Madrid sin desfase; coherencia tabla/agenda después de cada escritura; navegación por teclado y foco.

**Aceptación:** AM-03 refleja los mismos datos que el listado; todas las acciones utilizan los servicios ya probados. Revisión visual real de escritorio y móvil, o límite explícito si la herramienta no permite comprobarlo.

### Fase 6 — Avisos y recordatorios internos

- 6.1. Diseñar bandeja, contador y estados de lectura; concretar el texto y la ventana de 30 minutos.
- 6.2. Registrar avisos de cambios confirmados, sin emitirlos por operaciones rechazadas.
- 6.3. Calcular próximos inicios con hora de referencia del servidor y fecha civil Madrid.
- 6.4. Renovar avisos al abrir/recuperar foco y mientras la aplicación esté visible, sin duplicados.
- 6.5. Invalidar recordatorios obsoletos y conservar lectura por navegador.

**Pruebas con reloj controlado:** antes, justo al entrar y después de la ventana; cambio de día y horario estacional; cancelación y reprogramación; cambio de técnico; múltiples actualizaciones sin duplicados; recarga y lectura persistida; servidor caído y recuperación; eventos fallidos sin aviso de éxito.

**Aceptación:** AM-08 muestra avisos pertinentes y actuales. No se promete envío de correo ni funcionamiento con navegador cerrado. La ausencia de autenticación queda reflejada en el alcance compartido.

### Fase 7 — Acabado visual y accesibilidad

- 7.1. Cerrar una dirección visual única para tabla, agenda, formularios, fichas y avisos.
- 7.2. Revisar tamaño de texto, contraste, jerarquía, espaciado y controles.
- 7.3. Revisar escritorio/móvil y todos los estados: vacío, carga, éxito, rechazo y conexión perdida.
- 7.4. Revisar etiquetas, foco, teclado y confirmaciones; reducir pasos innecesarios en la programación.

**Pruebas:** inspección visual en tamaños representativos; flujo completo con teclado; mensajes comprensibles; formulario básico sin campos obligatorios añadidos; ninguna acción peligrosa por pulsaciones repetidas; servidor activo y recuperación de conexión explicada.

**Aceptación:** experiencia consistente y utilizable, sin sacrificar legibilidad ni ocultar reglas. No se da por verificada una vista que no se haya podido inspeccionar.

### Fase 8 — Regresión integral y preparación de entrega

- 8.1. Repetir toda la batería original junto con las nuevas pruebas.
- 8.2. Ejecutar casos combinados: tipo → propuesta → reserva → anotación → reprogramación → aviso → cancelación.
- 8.3. Validar bloqueos, desplazamientos y concurrencia con PostgreSQL real en la base de pruebas.
- 8.4. Comprobar tipos, lint, build y arranque de la versión compilada.
- 8.5. Ensayar migración desde una versión anterior e instalación desde cero; volver a medir el arranque documentado.
- 8.6. Realizar el guion personal con el usuario y registrar cada resultado sin inferir validaciones no confirmadas.
- 8.7. Actualizar README, matriz, diario, pruebas, estado y resumen de una página; revisar secretos y generar el paquete final desde un commit limpio.

**Aceptación:** cero fallos bloqueantes conocidos en las comprobaciones ejecutadas; cada requisito enlazado a implementación y evidencia; pendientes y límites expresos; instalación reproducible; archivos de entrega coherentes con la versión probada.

### Fase 9 — Publicación y cierre

- 9.1. Presentar el contenido final y el destino de GitHub para la aprobación de publicación acordada.
- 9.2. Tras autorizarlo, publicar y comprobar el repositorio público.
- 9.3. Decidir el despliegue por separado y verificar los flujos en la URL si se realiza.
- 9.4. Preparar la información de entrega y explicación para la entrevista. El envío a terceros requiere una instrucción expresa.

**Aceptación:** enlaces y contenido verificados, documentación final con los pendientes reales, y ningún secreto publicado.

## 4. Método de trabajo de cada subfase

1. Explicar objetivo y decisiones importantes antes de cambiar comportamiento.
2. Definir casos positivos, negativos, extremos y regresiones antes de la regla.
3. Implementar un bloque coherente, con migraciones compatibles cuando corresponda.
4. Ejecutar pruebas de la parte nueva y de las funciones existentes que afecta.
5. Investigar los fallos, corregir y repetir las comprobaciones afectadas.
6. Probar el flujo real por interfaz y servidor; distinguir prueba automática, inspección del agente y validación del usuario.
7. Actualizar documentos y cerrar un commit verificado. Una prueba fallida impide cerrar el bloque.
8. Comunicar qué cambió, qué se comprobó, qué falta, incidencias y siguiente subfase.

No basta con aumentar el número de tests. Las pruebas deben detectar comportamientos incorrectos, especialmente al combinar cambios nuevos con reservas anteriores. La batería original sirve como referencia, pero se añaden casos cruzados que todavía no existen.

## 5. Matriz de interacciones de mayor riesgo

| Interacción | Garantía que se comprobará |
|---|---|
| Tipo × reserva existente | Cambiar una plantilla no modifica fecha, duración ni obra de visitas guardadas. |
| Nota/resultado × cancelación | Seguimiento opcional, persistente, sin alterar la disponibilidad por sí solo. |
| Bloqueo × desplazamiento | Una ausencia no se usa como tiempo disponible para viajar. |
| Bloqueo × creación concurrente | No se confirma una combinación incompatible. |
| Reprogramación × creación/cancelación | Una operación atómica, sin pérdida de la original ni sobrescritura silenciosa. |
| Sugerencia × cambio concurrente | Se valida de nuevo al confirmar; consultar no reserva. |
| Agenda × listado | Ambos muestran el mismo resultado después de cada cambio. |
| Aviso × reprogramación/cancelación | No queda un recordatorio con fecha, técnico o estado obsoletos. |
| Red interrumpida × cualquier escritura | Resultado incierto explicado; no se reenvía automáticamente la escritura. |
| Migración × datos previos | IDs, referencias, estados, horas y anotaciones existentes conservados. |

## 6. Situación al crear este plan

- Ocho funciones seleccionadas; avisos dentro de la aplicación confirmados.
- Repositorio inspeccionado sin cambios locales al empezar la planificación.
- Plan, criterios y pruebas de diseño preparados. Ninguna ampliación declarada implementada.
- Base verificada de nuevo en esta fase: 79 unitarias, 21 de integración, tipos y lint correctos. La compilación correcta pertenece al hito anterior sin cambios funcionales; no se ha repetido innecesariamente. Creación confirmada por el usuario.
- La herramienta de navegador rechazó el acceso en la sesión anterior. No se ha reintentado ni eludido ese acceso al planificar; cualquier comprobación visual posterior deberá usar una vía autorizada.
- Fase 0.1–0.3 completada. Próximo bloque: diseño de interacción (1.1) y preparación de los casos/migraciones (0.4 y 1.2), antes de aplicar cambios funcionales.

## Avance de implementación

01/11/2026, fase 1: subfases 0.4 y 1.1–1.6 implementadas; 83 unitarias, 26 integraciones, tipos/lint/build correctos y migración aplicada. AM-05/06/07 disponibles en la versión local. Inspección visual y validación personal pendientes; se mantienen en el cierre transversal. Siguiente bloque: fase 2, bloqueos.

Fase 2 (2.1–2.5): AM-04 implementado y verificado con 90 unitarias, 31 integraciones y tipos/lint/build. Migración aplicada y versión local actualizada. Próximo bloque: reprogramación atómica, control de versión e historial. La validación visual sigue pendiente.

Fase 3 (3.1–3.5): reprogramación, versión e historial implementados. 91 unitarias, integración completa de 38 casos y posterior grupo ampliado AM-02 de 9 casos correctos (40 disponibles), tipos/lint/build y consultas HTTP correctos. Migración aplicada. Sigue fase 4, búsqueda de huecos.
