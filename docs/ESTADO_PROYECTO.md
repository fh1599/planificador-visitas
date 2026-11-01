# Estado del proyecto

Actualizado: 01/11/2026. **Núcleo implementado y verificado automáticamente; creación confirmada por el usuario el 01/11/2026; resto de validación personal y publicación de GitHub pendientes.** La entrega externa todavía no está completada.

| Fase | Estado y evidencia |
|---|---|
| 0–1: análisis y diseño | Plan aprobado, incluidos Neon Free y supuestos de fechas/desplazamientos. |
| 2: estructura y persistencia | Next.js/TypeScript, esquema, migración y semilla operativos en PostgreSQL 18. |
| 3: reglas y servidor | 79 pruebas unitarias y 21 de integración superadas; escrituras serializadas por técnico. |
| 4: interfaz | Creación, consulta, filtros y cancelación comprobados por el agente en navegador de escritorio. Revisión visual móvil pendiente. |
| 5: calidad | Tipos, lint y build correctos; creación confirmada por el usuario. Resto de validación personal pendiente. |
| 6: horarios alternativos | Opcional, no iniciado; requiere decisión posterior. |
| 7: entrega | Documentación preparada y ensayo de arranque de 18,66 s. GitHub público pendiente. |

## Recuperar el trabajo

- Seguir el README. En el Mac de desarrollo existe `.env.local`, excluido de Git; no sobrescribirlo ni imprimirlo.
- `npm run dev` inicia `http://127.0.0.1:3000`. La agenda inicial muestra hoy en Madrid; Limpiar muestra todas las fechas.
- Neon Free contiene `visitas` para la aplicación y `visitas_test` para integración. Conexiones privadas en variables de entorno; los tests vacían exclusivamente sus visitas de prueba.
- Se conservan ejemplos ficticios del 30/10/2026 y una visita de comprobación del 01/11/2026 cancelada tras verificarla. Puede haber nuevas visitas del usuario; no borrar ni modificar registros ajenos a una prueba. No forman parte de la semilla.
- La semilla solo crea cuatro técnicos y cuatro obras, sin borrar ni duplicar catálogos ni visitas.
- No hay errores bloqueantes conocidos tras las pruebas registradas. Incidencias y correcciones en el diario.

## Siguiente acción

Realizar MAN-01–06 con el usuario, registrar su respuesta y corregir lo necesario. Después, presentar el contenido y obtener la aprobación de publicación del repositorio público. Despliegue y sugerencias se decidirán por separado. No enviar nada a Talent Clau sin instrucción expresa.

Las comprobaciones del agente no sustituyen la validación personal. Condiciones y límites de las evidencias en PRUEBAS.md.

## Incidencia de conexión del 01/11/2026

El usuario encontró `Failed to fetch` con una pestaña abierta y el servidor detenido. Se restableció el servidor y se corrigieron los mensajes de errores de red/respuesta ilegible. REG-002 añade ocho pruebas. El flujo de creación/persistencia/rechazo/cancelación se repitió por HTTP real. La herramienta de navegador bloqueó el acceso en esta sesión; no se declara repetida la validación visual. Mantener el servidor activo durante la comprobación del usuario y explicar que la versión local depende de ese proceso.

El usuario respondió «Ahora se guarda correctamente» tras recargar la versión corregida. Se considera confirmada la creación, no todo el guion MAN-01–06 ni la persistencia tras una segunda recarga.
