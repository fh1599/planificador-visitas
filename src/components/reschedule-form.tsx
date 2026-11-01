"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/client/api";
import { formatMinute } from "@/domain/time";
import type { VisitDetail } from "@/server/operations";
import type { Catalogs } from "@/server/visits";

export function RescheduleForm({ visit, catalogs, busy, setBusy, onSaved, onCancel }: { visit: VisitDetail["visit"]; catalogs: Catalogs; busy: boolean; setBusy: (value: boolean) => void; onSaved: () => Promise<void>; onCancel: () => void }) {
  const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const input = { version: visit.version, technicianId: Number(form.get("technicianId")), siteId: Number(form.get("siteId")), date: form.get("date"), startTime: form.get("startTime"), duration: Number(form.get("duration")) };
    setBusy(true); setError(""); let saved = false;
    try {
      await api(`/api/visits/${visit.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      saved = true; await onSaved();
    } catch (error) { setError(saved ? "La visita se ha reprogramado. Actualiza el detalle y la agenda antes de repetir el cambio." : error instanceof Error ? error.message : "No se pudo confirmar el cambio."); }
    finally { setBusy(false); }
  }
  return <form className="detail-form reschedule-form" onSubmit={save}><fieldset disabled={busy}>
    <h3>Nuevo horario</h3><p className="detail-help">Al confirmar se sustituye la planificación anterior. Las anotaciones y el tipo de visita se conservan.</p>
    <label>Obra<select name="siteId" required defaultValue={visit.siteId}>{catalogs.sites.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
    <label>Técnico<select name="technicianId" required defaultValue={visit.technicianId}>{catalogs.technicians.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
    <label>Fecha<input type="date" name="date" required defaultValue={visit.date} /></label>
    <div className="time-fields"><label>Hora de inicio<input type="time" name="startTime" required min="08:00" max="16:59" step={60} defaultValue={formatMinute(visit.startMinute)} /></label><label>Duración (min)<input type="number" name="duration" min={1} max={540} step={1} required defaultValue={visit.duration} /></label></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="dialog-actions"><button className="button secondary" type="button" onClick={onCancel}>Volver sin cambiar</button><button className="button primary" type="submit">{busy ? "Comprobando…" : "Confirmar nuevo horario"}</button></div>
  </fieldset></form>;
}
