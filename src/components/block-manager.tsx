"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/client/api";
import { displayDate, formatMinute } from "@/domain/time";
import type { Catalogs } from "@/server/visits";
import type { BlockRow } from "@/server/availability";
import { Modal } from "./modal";

export function BlockManager({ catalogs, today, onClose, onChange }: { catalogs: Catalogs; today: string; onClose: () => void; onChange: () => Promise<void> }) {
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    api<{ blocks: BlockRow[] }>("/api/blocks").then((data) => { if (active) { setBlocks(data.blocks); setLoaded(true); setError(""); } }).catch((error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [reload]);

  async function change(input: unknown, id?: number) {
    setBusy(true); setError(""); setMessage(""); let saved = false;
    try {
      await api(id ? `/api/blocks/${id}` : "/api/blocks", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      saved = true; setRemoveId(null);
      const data = await api<{ blocks: BlockRow[] }>("/api/blocks"); setBlocks(data.blocks); setLoaded(true);
      await onChange();
      setMessage(id ? "Bloqueo retirado. El horario vuelve a estar disponible." : "Disponibilidad bloqueada.");
    } catch (error) { setError(saved ? "El cambio se ha guardado. Actualiza la agenda antes de repetirlo." : error instanceof Error ? error.message : "No se pudo guardar el cambio."); }
    finally { setBusy(false); }
  }
  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void change({ technicianId: Number(form.get("technicianId")), startDate, endDate, startTime: allDay ? "08:00" : form.get("startTime"), endTime: allDay ? "17:00" : form.get("endTime"), reason: form.get("reason") });
  }
  return <Modal title="Disponibilidad del equipo" busy={busy} onClose={onClose}>
    <p className="detail-help">Bloquea ausencias, reuniones u otras franjas no disponibles. Se comprueban las visitas y los desplazamientos antes de guardar.</p>
    <form className="detail-form" onSubmit={create}><fieldset disabled={busy}>
      <label>Técnico<select name="technicianId" required defaultValue=""><option value="" disabled>Selecciona un técnico</option>{catalogs.technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <div className="time-fields"><label>Desde<input type="date" required value={startDate} onChange={(e) => { setStartDate(e.target.value); if (e.target.value > endDate) setEndDate(e.target.value); }} /></label><label>Hasta (incluido)<input type="date" required min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label></div>
      <label className="checkbox-label"><input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />Día completo · 08:00–17:00</label>
      {!allDay && <div className="time-fields"><label>Hora inicial<input type="time" name="startTime" required min="08:00" max="16:59" defaultValue="09:00" step={60} /></label><label>Hora final<input type="time" name="endTime" required min="08:01" max="17:00" defaultValue="10:00" step={60} /></label></div>}
      <label>Motivo (opcional)<input name="reason" maxLength={300} placeholder="Por ejemplo, ausencia o reunión" /></label>
      <p className="detail-help">La franja se aplica a cada día del intervalo seleccionado.</p>
      <button className="button primary" type="submit">{busy ? "Comprobando…" : "Crear bloqueo"}</button>
    </fieldset></form>
    {error && <div className="form-error" role="alert"><p>{error}</p><button className="text-button" type="button" disabled={busy} onClick={() => setReload((n) => n + 1)}>Actualizar bloqueos</button></div>}
    {message && <p className="notice success" role="status">{message}</p>}
    <section className="detail-section"><h3>Bloqueos activos</h3>{!loaded ? <p className="detail-help">{error ? "No se han podido cargar." : "Cargando…"}</p> : !blocks.length ? <p className="detail-help">No hay bloqueos activos.</p> : <ul className="block-list">{blocks.map((b) => <li key={b.id}><strong>{b.technicianName}</strong><p>{displayDate(b.startDate)}{b.endDate !== b.startDate && ` – ${displayDate(b.endDate)}`} · {formatMinute(b.startMinute)}–{formatMinute(b.endMinute)}</p><p className="preserve-text">{b.reason || "Indisponibilidad"}</p>{removeId === b.id ? <div className="inline-actions"><span>¿Liberar esta franja?</span><button type="button" className="button secondary" disabled={busy} onClick={() => setRemoveId(null)}>Volver</button><button type="button" className="button danger" disabled={busy} onClick={() => void change({ active: false }, b.id)}>Retirar bloqueo</button></div> : <button className="text-button" type="button" disabled={busy} onClick={() => setRemoveId(b.id)}>Retirar</button>}</li>)}</ul>}</section>
  </Modal>;
}
