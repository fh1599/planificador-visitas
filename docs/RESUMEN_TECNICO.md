# Planificador de visitas

Prueba técnica Talent Clau - Resumen técnico - 01/11/2026

## Implementación

Agenda para cuatro técnicos y cuatro obras ficticias. Permite crear, filtrar y cancelar visitas, conservando las canceladas y liberando su horario. El servidor explica rechazos por solapamiento, jornada o desplazamiento. Se añadieron búsqueda de huecos, reprogramación con historial, agenda diaria, bloqueos de disponibilidad, fichas de obra, notas/incidencias/resultados opcionales, tipos de visita y avisos internos. El formulario básico conserva cinco campos; las funciones adicionales se abren aparte. Los tipos proponen duraciones editables y sus cambios no alteran visitas anteriores.

## Decisiones y supuestos

Next.js, React y TypeScript en un proyecto; PostgreSQL en Neon Free, Drizzle para esquema/migraciones, Zod para entradas y Vitest para pruebas. Las reglas puras se comparten entre reserva, reprogramación y sugerencias. Las escrituras bloquean al técnico antes de leer disponibilidad; reprogramar bloquea la visita y los técnicos en orden estable. Una versión evita sobrescribir ediciones antiguas. Cambio e historial se confirman juntos, conservando la original si falla.

Fecha civil de Madrid, minutos enteros e intervalos con final excluido. Visitas completas entre 08:00 y 17:00. En la misma obra pueden ser consecutivas; obras con distinto ID necesitan 30 minutos continuos disponibles, incluso en el mismo municipio. Las ausencias no cuentan como viaje. No se exige traslado antes de la primera visita ni después de la última. Canceladas y anotaciones no bloquean horarios. No se imponen festivos, fines de semana, restricciones de pasado ni comida. Las sugerencias no reservan: se validan otra vez al confirmar.

## Verificación y pendientes

107 pruebas unitarias y 47 de integración PostgreSQL superadas, con extremos, migración desde el esquema anterior, persistencia y concurrencia. Tipos, lint y compilación correctos. Un servidor Next compilado auxiliar pasó el flujo HTTP completo con base aislada, incluidas las ocho ampliaciones y su combinación. Instalación limpia y semilla reproducibles; condiciones y tiempos en README y PRUEBAS.

El usuario confirmó creación, apariencia de la agenda y apertura del detalle. Quedan revisión real de móvil/teclado, validación personal del resto de acciones y publicación. Auditoría: producción sin avisos conocidos; pendiente un aviso moderado de minimatch en herramientas de desarrollo, documentado en SEGURIDAD. Demostración sin autenticación, con agenda compartida. Avisos internos con aplicación abierta/conectada, reloj del servidor y lectura por navegador; sin correo ni notificaciones con navegador cerrado.

## Uso de IA y corrección real

Codex apoyó análisis, código, pruebas y documentación; el usuario aprobó alcance y decisiones. Una comprobación en navegador detectó un error generado por IA: comparar Origin con la URL interna de Next, normalizada de 127.0.0.1 a localhost, rechazaba creaciones legítimas con HTTP 403. REG-001 reprodujo el fallo; se corrigió reconstruyendo la dirección solicitada con Host y se verificaron tanto el acceso legítimo como el rechazo de otros orígenes. Después se repitieron integración, compilación y el flujo real. El diario conserva evidencia de esta corrección y de los límites de las verificaciones.
