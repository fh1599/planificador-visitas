# Matriz de requisitos

Auditoría del 01/11/2026. IDs del plan aprobado, no numeración original del PDF. «Cumplido» se refiere a la implementación y evidencia indicada; **el usuario confirmó creación, apariencia de agenda y apertura del detalle; resto del guion manual pendiente**. Resultados detallados en PRUEBAS.md.

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
| EN-02 | README y arranque <10 min | README, lockfile y scripts | ENT-01 ampliado: 14,30 s con prerrequisitos listos | Cumplido en el entorno probado |
| EN-03 | Explicación de una página | Resumen técnico y PDF | ENT-04 | Cumplido; PDF de una página revisado |
| EN-04 | Uso de IA y corrección real | Diario, resumen y REG-001 | Fallo reproducido, corregido y verificado | Cumplido |
| OP-01 | Despliegue opcional | No iniciado | Decisión posterior | Pendiente, opcional |
| OP-02 | Sugerir horarios | Implementado como AM-01 | Unitarias, integración y HTTP | Cumplido; revisión personal pendiente |

Tipos, lint y build correctos. Últimos resultados: 107 unitarias, 47 integraciones y flujo HTTP real de las ocho ampliaciones. La auditoría actual de producción no señala vulnerabilidades conocidas; la completa tiene un aviso moderado de minimatch propagado a 18 paquetes de desarrollo. Detalle en SEGURIDAD.md. Demostración con datos ficticios y sin autenticación.

## Ampliación implementada

Criterios, dependencias y pruebas de diseño en [PLAN_AMPLIACION.md](PLAN_AMPLIACION.md). «Implementado» no implica aceptación visual/personal completa. Todas las ampliaciones se recorrieron además en `scripts/smoke-http.ts` contra un servidor Next compilado con base aislada.

| ID | Función | Implementación principal | Evidencia |
|---|---|---|---|
| AM-01 | Huecos y alternativas | Dominio de sugerencias, consulta de solo lectura, API y panel separado | suggestions.test.ts; integración AM-01; propuesta obsoleta rechazada al reservar |
| AM-02 | Reprogramación e historial | Versión, bloqueo ordenado, PUT y formulario de detalle | Integración AM-02: conservación, error atómico y carreras; validación unitaria de entrada |
| AM-03 | Agenda diaria | agenda.ts, DayAgenda, navegación y listado alternativo | agenda.test.ts, day-agenda.test.ts, SSR/HTTP; usuario confirmó apariencia y apertura de detalle |
| AM-04 | Disponibilidad | Bloqueos por franja/rango, servicio transaccional y panel | availability.test.ts; integración AM-04, desplazamientos y carrera con reserva |
| AM-05 | Fichas de obra | Perfil opcional de las obras existentes, API y catálogo/detalle | operations.test.ts; integración AM-05/06/07; actualización y lectura HTTP |
| AM-06 | Notas, incidencias y resultados | Anotaciones opcionales en detalle, sin alterar disponibilidad | Validación de texto; integración conserva notas tras reprogramar/cancelar |
| AM-07 | Tipos opcionales | Catálogo, duración manual y copia histórica de indicaciones | Integración: tipo desactivado, cambios no retroactivos y visitas antiguas sin tipo |
| AM-08 | Avisos internos | Eventos, recordatorios Madrid, consulta visible y lectura por navegador | notifications.test.ts, notification-poller.test.ts; integración AM-08 y flujo combinado |

Las migraciones se ensayaron desde el esquema original con visitas programadas/canceladas en un esquema aislado de la base de pruebas. Se conservaron identificadores, referencias, horarios, estados y fechas de creación. El núcleo RF/RT/EN sigue siendo obligatorio.

REG-001 cubre el origen normalizado por Next. REG-002 cubre conexión y respuestas ilegibles; no se reenvían escrituras inciertas automáticamente. La revisión móvil/teclado y el resto de validación personal siguen pendientes, al igual que GitHub y la decisión de despliegue.
