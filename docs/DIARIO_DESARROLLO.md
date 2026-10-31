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
