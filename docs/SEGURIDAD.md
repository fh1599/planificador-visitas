# Dependencias y alcance de seguridad

Comprobación: 01/11/2026, versiones fijadas en package-lock.json. Esta revisión de dependencias y archivos no equivale a una auditoría integral de seguridad.

## Resultado de npm

| Comando | Resultado |
|---|---|
| `npm audit --omit=dev` | 0 vulnerabilidades conocidas. |
| `npm audit` | 18 resultados moderados, 0 altos y 0 críticos; todos derivan de un mismo aviso de minimatch. |

El aviso [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) describe consumo excesivo de CPU/memoria al procesar determinados patrones glob controlados por un atacante. La versión corregida indicada es 11.0.1; el rango publicado es `<11.0.1`. La descripción concreta se refiere a minimatch 10.2.6 con `optimizationLevel >= 2`.

El árbol instalado contiene minimatch 3.1.5 a través de ESLint y sus complementos, y 10.2.6 a través de typescript-eslint. Son dependencias de desarrollo. Los 18 resultados son la propagación por paquetes dependientes, no 18 fallos distintos de la aplicación. La ausencia de avisos en producción no demuestra ausencia de cualquier vulnerabilidad ni elimina el pendiente de desarrollo.

## Decisión y seguimiento

`npm audit` devuelve `fixAvailable: false` para el árbol actual. La consulta del registro confirma 3.1.5 como última versión de minimatch 3 y 9.39.5 como última de ESLint 9. Los consumidores instalados requieren rangos 3.x y 10.x; reemplazarlos globalmente por 11.x excedería esos contratos. Se mantienen las versiones verificadas, sin una sustitución mayor forzada ni excepciones que oculten el aviso.

Los datos del formulario de visitas no se utilizan como patrones para ejecutar ESLint. Esto delimita el uso observado; no se presenta como una prueba exhaustiva de inexplotabilidad. No se han ejecutado cargas maliciosas para medir la vulnerabilidad.

Pendiente: revisar versiones compatibles del conjunto ESLint/Next/typescript-eslint, o una corrección mantenida por sus responsables. Tras actualizar: instalación limpia, auditoría, tipos, lint, pruebas y compilación. Si continúa el aviso, conservarlo documentado. Repetir las auditorías antes de publicar, ya que el registro de avisos cambia con el tiempo.

## Aplicación y entrega

Demostración con datos ficticios y sin autenticación. Quien tenga acceso puede consultar y modificar la agenda. La comprobación de Origin no sustituye cuentas o autorización. Las entradas se validan en el servidor; las reglas entre filas se garantizan en servicios transaccionales y no protegen escrituras SQL externas que los omitan.

Las conexiones se configuran localmente mediante variables de entorno. El paquete incluye `.env.example` vacío y excluye `.env.local`, dependencias, compilados, documentos privados y archivos temporales. La entrega se genera desde un commit y se revisa buscando valores privados conocidos, patrones de credenciales y archivos excluidos. No se publica ni se envía a terceros durante esta preparación local.
