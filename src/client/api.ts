export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, cache: "no-store" });
  } catch {
    // A lost response does not prove that a write failed. Never retry it here.
    throw new Error("No se ha recibido respuesta de la agenda. Comprueba que la aplicación sigue en marcha y actualiza el listado antes de repetir la operación.");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("No se ha podido confirmar el resultado porque la respuesta de la agenda no se pudo leer. Actualiza el listado antes de repetir la operación.");
  }

  if (!response.ok) {
    const error = data && typeof data === "object" && "error" in data ? data.error : null;
    const message = error && typeof error === "object" && "message" in error ? error.message : null;
    throw new Error(typeof message === "string" && message ? message : "No se pudo completar la operación. Actualiza la agenda y vuelve a comprobarlo.");
  }
  return data as T;
}
