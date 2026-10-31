import { ZodError } from "zod";
import { VisitError } from "./visits";

export function assertMutationRequest(request: Request) {
  const origin = request.headers.get("origin");
  // Next can normalize request.url to localhost. Host retains the address
  // actually used by the browser (including its port).
  const publicUrl = new URL(request.url);
  const host = request.headers.get("host");
  if (host) publicUrl.host = host;
  if ((origin && origin !== publicUrl.origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new VisitError("INVALID_ORIGIN", "Esta operación debe hacerse desde la aplicación.", 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new VisitError("INVALID_CONTENT_TYPE", "La solicitud debe contener datos JSON.", 415);
  }
}

export async function respond(action: () => Promise<unknown>, status = 200) {
  try {
    return Response.json(await action(), { status, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: { code: "INVALID_INPUT", message: "Revisa los campos: hay datos ausentes o no válidos.", fields: error.flatten().fieldErrors } }, { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: { code: "INVALID_JSON", message: "No se ha podido leer la solicitud." } }, { status: 400 });
    }
    if (error instanceof VisitError) {
      return Response.json({ error: { code: error.code, message: error.message } }, { status: error.httpStatus });
    }
    // Never include raw driver errors: they may contain SQL or connection details.
    console.error("No se pudo completar la operación de visitas.", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: { code: "SERVICE_UNAVAILABLE", message: "No se ha podido conectar con la agenda. Inténtalo de nuevo en unos segundos." } }, { status: 503 });
  }
}
