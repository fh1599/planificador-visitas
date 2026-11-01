"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, CheckCircle2, Clock3, Filter, HardHat, Info, MapPin, Plus, RefreshCw, ShieldCheck, Users, X } from "lucide-react";
import type { Catalogs, VisitRow } from "@/server/visits";
import { displayDate, formatMinute } from "@/domain/time";
import { api } from "@/client/api";
import { CatalogManager } from "./catalog-manager";
import { VisitDetail } from "./visit-detail";
import { BlockManager } from "./block-manager";
import { SlotSearch } from "./slot-search";
import type { Slot } from "@/domain/suggestions";
import type { BlockRow } from "@/server/availability";
import { DayAgenda } from "./day-agenda";
import { shiftDate } from "@/domain/agenda";

type Filters = { date: string; technicianId: string };
type Notice = { text: string; tone: "success" | "error" } | null;

export function Planner({ catalogs: initialCatalogs, initialVisits, initialBlocks, today }: { catalogs: Catalogs; initialVisits: VisitRow[]; initialBlocks: BlockRow[]; today: string }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [view, setView] = useState<"day" | "list">("day");
  const [catalogs, setCatalogs] = useState(initialCatalogs);
  const [manageCatalogs, setManageCatalogs] = useState(false);
  const [manageBlocks, setManageBlocks] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [typeId, setTypeId] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [draft, setDraft] = useState({ siteId: "", technicianId: "", date: today });
  const [visits, setVisits] = useState(initialVisits);
  const [filters, setFilters] = useState<Filters>({ date: today, technicianId: "" });
  const [applied, setApplied] = useState(filters);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [formError, setFormError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<VisitRow | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("60");
  const dialog = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const busy = loading || saving || cancelling;
  const activeCount = visits.filter((v) => v.status === "Programada").length;
  const cancelledCount = visits.length - activeCount;
  const [hours, minutes] = startTime.split(":").map(Number);
  const endMinute = hours * 60 + minutes + Number(duration);
  const validEnd = Number.isFinite(endMinute) && Number(duration) > 0 && endMinute < 1440;
  const headingDate = applied.date ? new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Madrid" }).format(new Date(`${applied.date}T12:00:00Z`)) : "Todas las fechas";

  useEffect(() => {
    if (cancelTarget && !dialog.current?.open) dialog.current?.showModal();
    if (!cancelTarget && dialog.current?.open) dialog.current?.close();
  }, [cancelTarget]);

  async function loadVisits(nextFilters: Filters) {
    const params = new URLSearchParams();
    if (nextFilters.date) params.set("date", nextFilters.date);
    if (nextFilters.technicianId) params.set("technicianId", nextFilters.technicianId);
    const [data, availability] = await Promise.all([api<{ visits: VisitRow[] }>(`/api/visits?${params}`), api<{ blocks: BlockRow[] }>(`/api/blocks?${params}`)]);
    setVisits(data.visits);
    setBlocks(availability.blocks);
    setApplied(nextFilters);
  }

  async function applyFilters(event?: FormEvent, next = filters) {
    event?.preventDefault();
    setLoading(true);
    setNotice(null);
    try { await loadVisits(next); }
    catch { setNotice({ text: "No se pudo actualizar la agenda. Conservamos la última consulta; vuelve a intentarlo.", tone: "error" }); }
    finally { setLoading(false); }
  }

  async function createVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = { technicianId: Number(form.get("technicianId")), siteId: Number(form.get("siteId")), date: String(form.get("date")), startTime: String(form.get("startTime")), duration: Number(form.get("duration")), ...(typeId ? { typeId: Number(typeId) } : {}) };
    setSaving(true);
    setFormError("");
    setNotice(null);
    let saved = false;
    try {
      await api("/api/visits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      saved = true;
      const next = { date: input.date, technicianId: "" };
      await loadVisits(next);
      setFilters(next);
      setNotice({ text: `Visita programada para el ${displayDate(input.date)} a las ${input.startTime}.`, tone: "success" });
    } catch (error) {
      if (saved) setNotice({ text: "La visita se ha guardado, pero no se pudo actualizar el listado. Pulsa Actualizar antes de repetir la operación.", tone: "error" });
      else setFormError(error instanceof Error ? error.message : "No se pudo guardar la visita. Inténtalo de nuevo.");
    } finally { setSaving(false); }
  }

  async function cancelVisit() {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError("");
    let saved = false;
    try {
      await api(`/api/visits/${cancelTarget.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Cancelada", version: cancelTarget.version }) });
      saved = true;
      setCancelTarget(null);
      await loadVisits(applied);
      setNotice({ text: "Visita cancelada. El horario vuelve a estar disponible.", tone: "success" });
    } catch (error) {
      if (saved) setNotice({ text: "La visita se ha cancelado. Pulsa Actualizar para volver a cargar la agenda.", tone: "error" });
      else setCancelError(error instanceof Error ? error.message : "No se pudo cancelar la visita.");
    } finally { setCancelling(false); }
  }

  function useSlot(slot: Slot) {
    setDraft({ siteId: String(slot.siteId), technicianId: String(slot.technicianId), date: slot.date });
    setStartTime(formatMinute(slot.startMinute)); setDuration(String(slot.duration)); setSearchOpen(false); setFormError("");
    setNotice({ text: "Horario aplicado al formulario. Revisa los datos y pulsa Programar visita para confirmar.", tone: "success" });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function moveDay(days: number) {
    const next = { ...applied, date: days ? shiftDate(applied.date || today, days) : today };
    setFilters(next); void applyFilters(undefined, next);
  }

  return <>
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="Planificador de visitas, inicio"><span className="brand-symbol"><HardHat size={23} strokeWidth={1.8} aria-hidden="true" /></span><span>Planificador<span className="brand-caption">DE VISITAS</span></span></Link>
        <div className="nav-current"><CalendarDays size={16} aria-hidden="true" /> Agenda</div>
        <div className="topbar-note"><span className="status-dot" /> Jornada de 08:00 a 17:00</div>
      </div>
    </header>

    <main className="workspace">
      <div className="workspace-tools"><button type="button" className="button secondary" disabled={busy} onClick={() => setManageBlocks(true)}>Disponibilidad</button><button type="button" className="button secondary" disabled={busy} onClick={() => setManageCatalogs(true)}>Obras y tipos</button></div>
      <div className="page-heading">
        <div><p className="eyebrow">PLANIFICACIÓN DEL EQUIPO</p><h1>Agenda de visitas<span className="heading-dot">.</span></h1><p className="page-description">Cada obra a su hora. Organiza las visitas y evita conflictos.</p></div>
        <div className="team-indicator"><span className="team-icon"><Users size={20} aria-hidden="true" /></span><span><strong>{catalogs.technicians.length} técnicos</strong><small>{catalogs.sites.length} obras en el catálogo</small></span></div>
      </div>

      <div className="planner-layout">
        <section className="agenda" aria-labelledby="agenda-title">
          <form className="filters panel" onSubmit={applyFilters}>
            <div className="filter-caption"><Filter size={15} aria-hidden="true" /> Filtrar agenda</div>
            <fieldset disabled={busy} className="filter-fields">
              <label htmlFor="filter-date">Fecha<input id="filter-date" type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} /></label>
              <label htmlFor="filter-technician">Técnico<select id="filter-technician" value={filters.technicianId} onChange={(e) => setFilters({ ...filters, technicianId: e.target.value })}><option value="">Todos los técnicos</option>{catalogs.technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
              <button className="button secondary" type="submit">{loading ? "Cargando…" : "Aplicar"}</button>
              <button className="text-button clear-filters" type="button" onClick={() => { const next = { date: "", technicianId: "" }; setFilters(next); void applyFilters(undefined, next); }}>Limpiar</button>
            </fieldset>
          </form>

          {notice && <div role={notice.tone === "error" ? "alert" : "status"} className={`notice ${notice.tone}`}><CheckCircle2 size={17} aria-hidden="true" /><span>{notice.text}</span><button type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)}><X size={15} /></button></div>}

          <div className="agenda-heading"><div><p className="eyebrow">TU AGENDA</p><h2 id="agenda-title">{headingDate}</h2></div><button className="icon-button" type="button" aria-label="Actualizar agenda" disabled={busy} onClick={() => void applyFilters(undefined, applied)}><RefreshCw size={18} className={loading ? "spin" : ""} /></button></div>
          <div className="agenda-counts"><span><i className="legend-dot active" />{activeCount} {activeCount === 1 ? "programada" : "programadas"}</span><span><i className="legend-dot cancelled" />{cancelledCount} {cancelledCount === 1 ? "cancelada" : "canceladas"}</span>{applied.technicianId && <span className="filtered-label">{catalogs.technicians.find((t) => String(t.id) === applied.technicianId)?.name}</span>}</div>

          <div className="agenda-toolbar"><div className="segmented" aria-label="Vista de la agenda"><button type="button" aria-pressed={view === "day" && !!applied.date} disabled={!applied.date} title={!applied.date ? "Selecciona una fecha para ver el día" : "Ver agenda diaria"} onClick={() => setView("day")}>Agenda diaria</button><button type="button" aria-pressed={view === "list" || !applied.date} onClick={() => setView("list")}>Listado</button></div><div className="date-navigation"><button className="icon-button" aria-label="Día anterior" disabled={busy} type="button" onClick={() => moveDay(-1)}>‹</button><button className="button secondary" type="button" disabled={busy} onClick={() => moveDay(0)}>Hoy</button><button className="icon-button" aria-label="Día siguiente" disabled={busy} type="button" onClick={() => moveDay(1)}>›</button></div></div>
          {view === "day" && applied.date ? <div aria-busy={loading}><DayAgenda date={applied.date} technicianId={applied.technicianId} catalogs={catalogs} visits={visits} blocks={blocks} onDetail={setDetailId} /></div> : <div className="visits-panel panel" aria-busy={loading}>
            {visits.length ? <div className="table-scroll"><table><caption className="sr-only">Visitas ordenadas por fecha y hora</caption><thead><tr><th>Fecha / hora</th><th>Técnico</th><th>Obra</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{visits.map((visit) => <tr key={visit.id} className={visit.status === "Cancelada" ? "cancelled-row" : ""}>
              <td><span className="visit-time">{formatMinute(visit.startMinute)}<span>–</span>{formatMinute(visit.startMinute + visit.duration)}</span><small>{displayDate(visit.date)} <span className="date-dot">·</span> {visit.duration} min</small></td>
              <td><div className="person"><span className={`avatar avatar-${visit.technicianId % 4}`} aria-hidden="true">{visit.technicianName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span>{visit.technicianName}</span></div></td>
              <td><button type="button" className="site-name site-detail-link" onClick={() => setDetailId(visit.id)} aria-label={`Ver detalle de la visita a ${visit.siteName}`}>{visit.siteName}</button><small className="municipality"><MapPin size={11} aria-hidden="true" />{visit.municipality}</small>{visit.typeName && <small>{visit.typeName}</small>}</td>
              <td><span className={`badge ${visit.status === "Programada" ? "scheduled" : "cancelled"}`}><span />{visit.status}</span></td>
              <td>{visit.status === "Programada" ? <button className="cancel-link" type="button" disabled={busy} aria-label={`Cancelar visita de ${visit.technicianName} el ${displayDate(visit.date)} a las ${formatMinute(visit.startMinute)}`} onClick={() => { setCancelError(""); setCancelTarget(visit); }}>Cancelar</button> : <span className="no-action" aria-label="Visita cancelada">—</span>}</td>
            </tr>)}</tbody></table></div> : <div className="empty-state"><span className="empty-icon"><CalendarDays size={28} strokeWidth={1.5} aria-hidden="true" /></span><h3>La agenda está despejada</h3><p>No hay visitas para esta selección.<br />Programa una nueva o cambia los filtros.</p><button className="text-button" type="button" onClick={() => { formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); formRef.current?.querySelector<HTMLSelectElement>("select")?.focus({ preventScroll: true }); }}>Programar una visita <ArrowRight size={15} aria-hidden="true" /></button></div>}
            <div className="table-footer"><span>{visits.length} {visits.length === 1 ? "visita en esta consulta" : "visitas en esta consulta"}</span><span>Ordenadas por fecha y hora</span></div>
          </div>}
          <p className="agenda-footnote"><Info size={14} aria-hidden="true" />Las visitas canceladas se conservan en el historial y dejan libre el horario.</p>
        </section>

        <aside className="create-column" aria-labelledby="create-title">
          <div className="create-panel panel"><div className="create-heading"><span className="plus-icon"><Plus size={21} aria-hidden="true" /></span><div><h2 id="create-title">Nueva visita</h2><p>Asigna una obra y un horario.</p></div></div>
            <form onSubmit={createVisit} ref={formRef}>
              <fieldset disabled={busy || !catalogs.technicians.length || !catalogs.sites.length}>
                <details className="optional-type"><summary>{typeId ? `Tipo: ${catalogs.types.find((t) => String(t.id) === typeId)?.name ?? "Seleccionado"}` : "Usar un tipo de visita (opcional)"}</summary><label>Tipo<select value={typeId} onChange={(e) => { setTypeId(e.target.value); const type = catalogs.types.find((t) => String(t.id) === e.target.value); if (type) setDuration(String(type.duration)); }}><option value="">Sin tipo · duración manual</option>{catalogs.types.filter((t) => t.active || String(t.id) === typeId).map((t) => <option key={t.id} value={t.id} disabled={!t.active}>{t.name} · {t.duration} min{!t.active && " · Desactivado"}</option>)}</select></label><p className="detail-help">La duración propuesta se puede ajustar. Gestiona tus tipos en «Obras y tipos».</p></details>
                <label htmlFor="new-site">Obra<select id="new-site" name="siteId" required value={draft.siteId} onChange={(e) => setDraft({ ...draft, siteId: e.target.value })}><option value="" disabled>Selecciona una obra</option>{catalogs.sites.map((site) => <option key={site.id} value={site.id}>{site.name} · {site.municipality}</option>)}</select></label>
                <label htmlFor="new-technician">Técnico<select id="new-technician" name="technicianId" required value={draft.technicianId} onChange={(e) => setDraft({ ...draft, technicianId: e.target.value })}><option value="" disabled>Selecciona un técnico</option>{catalogs.technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
                <label htmlFor="new-date">Fecha<input type="date" id="new-date" name="date" required value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></label>
                <div className="time-fields"><label htmlFor="new-time">Hora de inicio<input type="time" id="new-time" name="startTime" required min="08:00" max="16:59" step="60" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label><label htmlFor="new-duration">Duración <span className="label-unit">(min)</span><input type="number" id="new-duration" name="duration" required min="1" max="540" step="1" value={duration} onChange={(e) => setDuration(e.target.value)} /></label></div>
                <div className="end-preview"><Clock3 size={15} aria-hidden="true" /><span>Finalización prevista</span><strong>{validEnd ? formatMinute(endMinute) : "—"}</strong></div>
                {formError && <div className="form-error" role="alert"><strong>No se ha podido confirmar la visita</strong><p>{formError}</p></div>}
                <button className="text-button search-slots-button" type="button" onClick={() => setSearchOpen(true)}>Buscar un horario libre</button>
                <button className="button primary create-submit" type="submit"><Plus size={17} aria-hidden="true" />{saving ? "Comprobando y guardando…" : "Programar visita"}</button>
              </fieldset>
            </form>
            <p className="form-caption"><ShieldCheck size={14} aria-hidden="true" />Comprobamos la disponibilidad al guardar.</p>
          </div>
          <div className="rules-note"><span className="rules-icon"><ShieldCheck size={19} aria-hidden="true" /></span><div><h3>Una planificación sin conflictos</h3><ul><li><Check size={13} aria-hidden="true" />Jornada de 08:00 a 17:00</li><li><Check size={13} aria-hidden="true" />Sin visitas solapadas</li><li><Check size={13} aria-hidden="true" />30 min entre obras diferentes</li></ul></div></div>
        </aside>
      </div>
      <footer className="page-footer"><span>Planificador de visitas</span><span>Horario local · Europe/Madrid</span></footer>
    </main>
    {searchOpen && <SlotSearch catalogs={catalogs} initial={{ ...draft, startTime, duration }} onApply={useSlot} onClose={() => setSearchOpen(false)} />}
    {manageCatalogs && <CatalogManager catalogs={catalogs} onChange={setCatalogs} onClose={() => setManageCatalogs(false)} />}
    {manageBlocks && <BlockManager catalogs={catalogs} today={today} onChange={() => loadVisits(applied)} onClose={() => setManageBlocks(false)} />}
    {detailId !== null && <VisitDetail key={detailId} id={detailId} catalogs={catalogs} onChange={() => loadVisits(applied)} onCancel={(visit) => { setDetailId(null); setCancelError(""); setCancelTarget(visit); }} onClose={() => setDetailId(null)} />}

    <dialog ref={dialog} className="cancel-dialog" onCancel={(event) => { if (cancelling) event.preventDefault(); else setCancelTarget(null); }} onClose={() => setCancelTarget(null)} aria-labelledby="cancel-title">
      <div className="dialog-icon"><CalendarDays size={24} aria-hidden="true" /></div><h2 id="cancel-title">¿Cancelar esta visita?</h2>
      {cancelTarget && <p><strong>{cancelTarget.technicianName}</strong> · {cancelTarget.siteName}<br />{displayDate(cancelTarget.date)}, de {formatMinute(cancelTarget.startMinute)} a {formatMinute(cancelTarget.startMinute + cancelTarget.duration)}.</p>}
      <p className="dialog-help">El horario quedará libre. La visita seguirá visible con el estado Cancelada.</p>
      {cancelError && <p className="form-error" role="alert">{cancelError}</p>}
      <div className="dialog-actions"><button type="button" className="button secondary" disabled={cancelling} onClick={() => setCancelTarget(null)} autoFocus>Volver</button><button type="button" className="button danger" disabled={cancelling} onClick={() => void cancelVisit()}>{cancelling ? "Cancelando…" : "Sí, cancelar visita"}</button></div>
    </dialog>
  </>;
}
