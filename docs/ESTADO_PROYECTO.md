# Estado del proyecto

Actualizado: 02/11/2026. **Núcleo y ocho ampliaciones implementados; repositorio público y demo publicados y verificados.** [GitHub](https://github.com/fh1599/planificador-visitas) · [Aplicación](https://planificador-visitas-neon.vercel.app). El usuario decidió conservar el diseño actual y priorizar la entrega. Quedan la revisión móvil/teclado, otras comprobaciones personales y el envío del correo.

| Bloque | Estado y evidencia |
|---|---|
| Núcleo | Crear, reglas, cancelación persistente, orden y filtros operativos. Se mantienen las regresiones originales. |
| AM-01: huecos | Hasta tres propuestas por huecos distintos; consulta sin reserva y revalidación al guardar. |
| AM-02: reprogramación | Cambio atómico, versión, historial y conservación de notas. |
| AM-03: agenda diaria | Cuatro columnas, visitas, bloqueos, desplazamientos y acceso al detalle; listado alternativo. |
| AM-04: disponibilidad | Franjas/rangos de días; rechazos identifican visitas afectadas; concurrencia protegida. |
| AM-05/06/07: información operativa | Fichas de obra, anotaciones opcionales y tipos con duración editable; cinco campos básicos conservados. |
| AM-08: avisos | Recordatorios de 30 minutos y actividad compartida, lectura por navegador y actualización visible. |
| Acabado | Estilo consistente, contraste, foco visible, controles táctiles y confirmación junto al formulario. Revisión real de móvil/teclado pendiente. |
| Verificación | 107 unitarias, 47 integraciones PostgreSQL, tipos/lint/build y flujo HTTP real correctos. |
| Entrega local | README, cinco migraciones, semilla, pruebas y resumen PDF de una página. Arranque desde copia limpia: 14,30 s con prerrequisitos listos. |
| Dependencias | Producción: cero avisos conocidos. Desarrollo: un aviso moderado de minimatch propagado a 18 paquetes, pendiente de actualización compatible; ver SEGURIDAD.md. |
| Publicación | GitHub público en fh1599 y demo Vercel Hobby verificados. Código publicado; correo a Talent Clau todavía no enviado. |

## Qué se ha confirmado personalmente

El usuario confirmó que una visita se guarda correctamente, que la agenda diaria se ve bien y que pulsar una visita abre su detalle. También confirmó añadir una nota opcional y reprogramar a un horario libre: la agenda se actualiza y la nota se conserva al volver a abrir el detalle. No se extiende esa confirmación a bloqueos, avisos, otros escenarios de reprogramación/seguimiento, móvil o teclado. La herramienta de navegador rechazó el acceso local durante la ampliación; no se eludió ese bloqueo. Posteriormente, la URL pública sí permitió verificar creación, recarga persistente, detalle y nota en escritorio. Esto no constituye una revisión completa de móvil/teclado.

## Recuperar el trabajo

- Seguir el README. La configuración privada existente está en `.env.local`, excluida de Git; no sobrescribirla ni imprimirla.
- `npm run dev` inicia `http://127.0.0.1:3000`; mantener el proceso activo mientras se use la aplicación. Para producción local: `npm run build` y `npm start`.
- La agenda comienza en hoy, Madrid. Limpiar elimina la fecha y muestra el listado completo.
- PostgreSQL contiene una base principal y otra independiente terminada en `_test`. Las pruebas destructivas solo actúan en esta última; no usarla para datos que se quieran conservar ni ejecutar integración y HTTP simultáneamente.
- Las cinco migraciones están aplicadas en la base principal. La semilla no borra visitas ni duplica los cuatro técnicos/obras. Se conservan las reservas del usuario.
- Incidencias históricas: rechazo de origen normalizado por Next y servidor detenido con pestaña abierta. Correcciones y alcance de la verificación en DIARIO_DESARROLLO.md y PRUEBAS.md.

## Publicación y trabajo restante

- La demo utiliza visitas_demo, con migraciones y cuatro técnicos/obras ficticios. No comparte las visitas ni notas de la base local. Se conserva la visita ficticia #4 del 02/11/2026, Carlos/Can Roca 09:00–10:00, creada desde el navegador y marcada como demostración mediante una nota.
- El despliegue directo por CLI está operativo; la integración automática con GitHub no se configuró porque Vercel no tenía acceso de integración al repositorio. No hace falta esa vinculación para usar la URL publicada.
- Se conservaron los commits de desarrollo y se sustituyó únicamente el correo de autor/committer por el noreply de GitHub en la copia publicada; el historial local original se conserva.
- Envío pendiente: correo a Talent Clau con enlaces verificados y texto preparado. No se ha enviado ningún mensaje al evaluador.
- Pendientes conocidos: revisión móvil/teclado, resto de comprobaciones personales y seguimiento del aviso moderado de herramientas de desarrollo (SEGURIDAD.md). El usuario decidió mantener el diseño actual para cerrar la publicación.

Las evidencias y límites están en PRUEBAS.md. No se presenta la revisión de escritorio como una validación visual exhaustiva.
