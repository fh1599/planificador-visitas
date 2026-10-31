# Estado del proyecto

Actualizado: 31/10/2026. **Núcleo implementado y verificado automáticamente; pendiente de validación personal del usuario y publicación de GitHub.** La entrega externa todavía no está completada.

| Fase | Estado y evidencia |
|---|---|
| 0–1: análisis y diseño | Plan aprobado, incluidos Neon Free y supuestos de fechas/desplazamientos. |
| 2: estructura y persistencia | Next.js/TypeScript, esquema, migración y semilla operativos en PostgreSQL 18. |
| 3: reglas y servidor | 71 pruebas unitarias y 21 de integración superadas; escrituras serializadas por técnico. |
| 4: interfaz | Creación, consulta, filtros y cancelación comprobados por el agente en navegador de escritorio. Revisión visual móvil pendiente. |
| 5: calidad | Tipos, lint y build correctos; validación personal del usuario pendiente. |
| 6: horarios alternativos | Opcional, no iniciado; requiere decisión posterior. |
| 7: entrega | Documentación preparada y ensayo de arranque de 18,66 s. GitHub público pendiente. |

## Recuperar el trabajo

- Seguir el README. En el Mac de desarrollo existe `.env.local`, excluido de Git; no sobrescribirlo ni imprimirlo.
- `npm run dev` inicia `http://127.0.0.1:3000`. La agenda inicial muestra hoy en Madrid; Limpiar muestra todas las fechas.
- Neon Free contiene `visitas` para la aplicación y `visitas_test` para integración. Conexiones privadas en variables de entorno; los tests vacían exclusivamente sus visitas de prueba.
- Se conservan cinco visitas ficticias del 30/10/2026 creadas al comprobar el navegador: cuatro Programadas y una Cancelada. No forman parte de la semilla.
- La semilla solo crea cuatro técnicos y cuatro obras, sin borrar ni duplicar catálogos ni visitas.
- No hay errores bloqueantes conocidos tras las pruebas registradas. Incidencias y correcciones en el diario.

## Siguiente acción

Realizar MAN-01–06 con el usuario, registrar su respuesta y corregir lo necesario. Después, presentar el contenido y obtener la aprobación de publicación del repositorio público. Despliegue y sugerencias se decidirán por separado. No enviar nada a Talent Clau sin instrucción expresa.

Las comprobaciones del agente no sustituyen la validación personal. Condiciones y límites de las evidencias en PRUEBAS.md.
