# Matriz de requisitos

Auditoría del 01/11/2026. IDs del plan aprobado, no numeración original del PDF. «Cumplido» se refiere a la implementación y evidencia indicada; **creación confirmada por el usuario el 01/11/2026; resto del guion manual pendiente**. Resultados detallados en PRUEBAS.md.

| ID | Requisito | Implementación | Evidencia | Resultado |
|---|---|---|---|---|
| RF-01 | Técnicos y obras ficticios | Semilla y selectores | INT-01, navegador | Cumplido |
| RF-02 | Crear y explicar rechazos | Entrada, servicio, POST y formulario | UNIT-01, INT-02/03, navegador | Cumplido |
| RF-03 | Evitar solapamientos | Dominio y transacción | UNIT-03/04, INT-06, navegador | Cumplido |
| RF-04 | 30 min entre obras distintas | Reglas en ambos sentidos | UNIT-05/06, integración, navegador 15/30 min | Cumplido |
| RF-05 | Jornada completa 08:00–17:00 | Entrada, dominio y SQL | UNIT-02, integración, navegador 17:00/17:01 | Cumplido |
| RF-06 | Cancelar, conservar y liberar | PATCH, servicio y listado | INT-04, navegador y recarga | Cumplido |
| RF-07 | Listado ordenado y campos | Consulta con joins y tabla | INT-05, navegador | Cumplido |
| RF-08 | Filtros fecha/técnico | GET validado y controles | INT-05, filtros combinados y vacío | Cumplido |
| RT-01 | Base relacional | PostgreSQL, Drizzle y SQL versionado | Migración inicial, INT-01, ENT-01 | Cumplido |
| RT-02 | Validación servidor | Zod, reglas y bloqueos | Peticiones directas inválidas y concurrencia | Cumplido |
| RT-03 | Sin secretos versionados | Variables privadas y gitignore | ENT-02, revisión de entrega | Cumplido en preparación local |
| EN-01 | GitHub público, código, migración y semilla | Repositorio local preparado | Sin URL pública todavía | Parcialmente cumplido; publicación pendiente |
| EN-02 | README y arranque <10 min | README, lockfile y scripts | ENT-01: 18,66 s con prerrequisitos listos | Cumplido en el entorno probado |
| EN-03 | Explicación de una página | Resumen técnico y PDF | ENT-04 | Cumplido; PDF de una página revisado |
| EN-04 | Uso de IA y corrección real | Diario, resumen y REG-001 | Fallo reproducido, corregido y verificado | Cumplido |
| OP-01 | Despliegue opcional | No iniciado | Decisión posterior | Pendiente, opcional |
| OP-02 | Sugerir horarios | Planificado como AM-01 | Alcance adicional seleccionado | Pendiente de implementar |

Tipos, lint y build correctos. Auditoría npm sin vulnerabilidades conocidas al comprobarla; no equivale a una auditoría completa de seguridad. Demostración con datos ficticios y sin autenticación.

REG-002 añade comprobaciones de conexión y respuestas ilegibles del cliente. Servidor local restablecido tras el fallo comunicado; creación confirmada por el usuario tras recargar. Resto de validación manual pendiente.

## Ampliación seleccionada

AM-01–08, criterios de aceptación, dependencias y pruebas previstas en [PLAN_AMPLIACION.md](PLAN_AMPLIACION.md). Estado de todos ellos: planificados, implementación y verificación pendientes. Se mantienen las obligaciones del núcleo RF/RT/EN.
