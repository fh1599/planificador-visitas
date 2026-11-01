"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/client/api";
import { displayDate, formatMinute } from "@/domain/time";
import type { Slot } from "@/domain/suggestions";
import type { Catalogs } from "@/server/visits";
import { Modal } from "./modal";

export type SearchDraft = { siteId: string; technicianId: string; date: string; startTime: string; duration: string };
export function SlotSearch({ catalogs, initial, onApply, onClose }: { catalogs: Catalogs; initial: SearchDraft; onApply: (slot: Slot) => void; onClose: () => void }) {
  const [results, setResults] = useState<Slot[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const technicianId = form.get("technicianId");
    const input = { siteId: Number(form.get("siteId")), ...(technicianId ? { technicianId: Number(technicianId) } : {}), date: form.get("date"), startTime: form.get("startTime"), duration: Number(form.get("duration")) };
    setBusy(true); setError(""); setResults(null);
    try { const data = await api<{ suggestions: Slot[] }>("/api/suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }); setResults(data.suggestions); }
    catch (error) { setError(error instanceof Error ? error.message : "No se pudo consultar la disponibilidad."); }
    finally { setBusy(false); }
  }
  return <Modal title="Buscar un horario libre" busy={busy} onClose={onClose}>
    <p className="detail-help">Hasta tres alternativas cercanas a tu hora preferida, respetando visitas, ausencias y desplazamientos.</p>
    <form className="detail-form" onSubmit={search} onChange={() => { setResults(null); setError(""); }}><fieldset disabled={busy}>
      <label>Obra<select name="siteId" defaultValue={initial.siteId} required><option value="" disabled>Selecciona una obra</option>{catalogs.sites.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
      <label>Buscar para<select name="technicianId" defaultValue={initial.technicianId}><option value="">Cualquier técnico del equipo</option>{catalogs.technicians.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
      <label>Fecha<input type="date" name="date" defaultValue={initial.date} required /></label>
      <div className="time-fields"><label>Hora preferida<input type="time" step={60} name="startTime" defaultValue={initial.startTime} required /></label><label>Duración (min)<input type="number" min={1} max={540} step={1} name="duration" defaultValue={initial.duration} required /></label></div>
      <button type="submit" className="button primary">{busy ? "Buscando…" : "Buscar alternativas"}</button>
    </fieldset></form>
    {error && <p className="form-error" role="alert">{error}</p>}
    {results && <section className="detail-section" aria-live="polite"><h3>{results.length ? "Horarios disponibles al consultar" : "No hay huecos para esta selección"}</h3>{!results.length && <p className="detail-help">Prueba con todo el equipo, otra fecha o una duración diferente.</p>}<ul className="slot-list">{results.map((slot) => <li key={`${slot.technicianId}-${slot.startMinute}`}><div><strong>{formatMinute(slot.startMinute)}–{formatMinute(slot.startMinute + slot.duration)}</strong><p>{slot.technicianName} · {displayDate(slot.date)}</p><small>{slot.duration} minutos</small></div><button type="button" className="button secondary" onClick={() => onApply(slot)}>Usar horario</button></li>)}</ul><p className="detail-help">Consultar no reserva. Al usar un horario, revisa el formulario y pulsa «Programar visita»; volveremos a comprobar que sigue libre.</p></section>}
  </Modal>;
}
