# Estado del proyecto

Actualizado: 01/11/2026. **Núcleo y ocho ampliaciones implementados; comprobaciones automáticas y flujo HTTP completo superados.** Documentación y paquete de código preparados. La entrega externa sigue pendiente: falta publicar el repositorio público obligatorio y completar la revisión personal/visual indicada abajo.

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
| Publicación | GitHub público pendiente; despliegue opcional pendiente de decisión. No se ha enviado material a terceros. |

## Qué se ha confirmado personalmente

El usuario confirmó que una visita se guarda correctamente, que la agenda diaria se ve bien y que pulsar una visita abre su detalle. No se extiende esa confirmación a reprogramación, bloqueos, anotaciones, avisos, móvil o teclado. La herramienta de navegador rechazó el acceso durante la ampliación; no se eludió ese bloqueo. Las pruebas HTTP no sustituyen interacción visual.

## Recuperar el trabajo

- Seguir el README. La configuración privada existente está en `.env.local`, excluida de Git; no sobrescribirla ni imprimirla.
- `npm run dev` inicia `http://127.0.0.1:3000`; mantener el proceso activo mientras se use la aplicación. Para producción local: `npm run build` y `npm start`.
- La agenda comienza en hoy, Madrid. Limpiar elimina la fecha y muestra el listado completo.
- PostgreSQL contiene una base principal y otra independiente terminada en `_test`. Las pruebas destructivas solo actúan en esta última; no usarla para datos que se quieran conservar ni ejecutar integración y HTTP simultáneamente.
- Las cinco migraciones están aplicadas en la base principal. La semilla no borra visitas ni duplica los cuatro técnicos/obras. Se conservan las reservas del usuario.
- Incidencias históricas: rechazo de origen normalizado por Next y servidor detenido con pestaña abierta. Correcciones y alcance de la verificación en DIARIO_DESARROLLO.md y PRUEBAS.md.

## Trabajo restante

1. Completar el guion personal de las ampliaciones y revisar móvil/teclado; registrar resultados concretos.
2. Seguir el aviso de herramientas de desarrollo y actualizar cuando haya una solución compatible verificada.
3. Con el contenido revisado, decidir el destino y autorizar la publicación del repositorio público. El ZIP no sustituye ese requisito.
4. Decidir por separado el despliegue opcional y, si se autoriza, verificar la URL publicada. El envío a Talent Clau requiere instrucción expresa.

Las fases y sus límites de aceptación se conservan en PLAN_AMPLIACION.md. No se da por cerrado el trabajo externo ni la revisión visual pendiente.
