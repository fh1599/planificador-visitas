"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/client/api";
import type { VisitDetail as Detail } from "@/server/operations";
import { displayDate, formatMinute } from "@/domain/time";
import { Modal } from "./modal";

export function VisitDetail({ id, onClose }: { id: number; onClose: () => void }) {
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("Nota");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    api<Detail>(`/api/visits/${id}`).then((value) => { if (active) { setData(value); setError(""); } }).catch((error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [id, reload]);

  async function annotate(event: FormEvent) {
    event.preventDefault(); if (!data) return;
    setBusy(true); setError("");
    try {
      const { annotation } = await api<{ annotation: Detail["annotations"][number] }>(`/api/visits/${id}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, body }) });
      setData({ ...data, annotations: [...data.annotations, annotation] }); setBody("");
    } catch (error) { setError(error instanceof Error ? error.message : "No se pudo guardar la anotación."); }
    finally { setBusy(false); }
  }

  return <Modal title={`Detalle de visita #${id}`} onClose={onClose} busy={busy}>
    {error && <div className="form-error" role="alert"><p>{error}</p><button className="text-button" type="button" disabled={busy} onClick={() => setReload((n) => n + 1)}>Actualizar detalle</button></div>}
    {!data ? <p className="detail-help">{error ? "No se ha podido cargar la visita." : "Cargando visita…"}</p> : <>
      <div className="visit-summary"><span className={`badge ${data.visit.status === "Programada" ? "scheduled" : "cancelled"}`}>{data.visit.status}</span><h3>{data.site.name}</h3><p>{data.technician.name} · {displayDate(data.visit.date)}</p><strong>{formatMinute(data.visit.startMinute)}–{formatMinute(data.visit.startMinute + data.visit.duration)} · {data.visit.duration} min</strong></div>
      <section className="detail-section"><h3>Datos de la obra</h3><dl className="site-facts"><dt>Dirección</dt><dd>{data.site.address || "Sin dirección indicada"} · {data.site.municipality}</dd><dt>Contacto</dt><dd>{data.site.contact || "Sin contacto indicado"}{data.site.phone && <> · <a href={`tel:${data.site.phone.replace(/[^+\d]/g, "")}`}>{data.site.phone}</a></>}</dd><dt>Acceso</dt><dd className="preserve-text">{data.site.accessNotes || "Sin indicaciones de acceso"}</dd></dl></section>
      {data.visit.typeName && <section className="detail-section"><h3>{data.visit.typeName}</h3><p className="preserve-text">{data.visit.typeInstructions || "Sin indicaciones específicas."}</p></section>}
      <section className="detail-section"><h3>Seguimiento</h3><p className="detail-help">Notas, incidencias y resultados opcionales. No cambian el estado ni el horario de la visita.</p>
        {data.annotations.length ? <ol className="annotation-list">{data.annotations.map((entry) => <li key={entry.id}><div><strong>{entry.kind}</strong><time dateTime={entry.createdAt}>{new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" }).format(new Date(entry.createdAt))}</time></div><p className="preserve-text">{entry.body}</p></li>)}</ol> : <p className="detail-help">Todavía no hay anotaciones.</p>}
        <form className="detail-form" onSubmit={annotate}><fieldset disabled={busy}><label>Qué quieres añadir<select value={kind} onChange={(e) => setKind(e.target.value)}><option>Nota</option><option>Incidencia</option><option>Resultado</option></select></label><label>Anotación<textarea required maxLength={4000} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Información útil para esta visita…" /></label><button type="submit" className="button primary">{busy ? "Guardando…" : "Añadir anotación"}</button></fieldset></form>
      </section>
    </>}
  </Modal>;
}
