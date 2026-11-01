"use client";

import type { Catalogs, VisitRow } from "@/server/visits";
import type { BlockRow } from "@/server/availability";
import { dayEntries, timelinePosition } from "@/domain/agenda";
import { formatMinute } from "@/domain/time";

export function DayAgenda({ date, technicianId, catalogs, visits, blocks, onDetail }: { date: string; technicianId: string; catalogs: Catalogs; visits: VisitRow[]; blocks: BlockRow[]; onDetail: (id: number) => void }) {
  const team = catalogs.technicians.filter((t) => !technicianId || String(t.id) === technicianId);
  const shortVisits = visits.filter((v) => v.date === date && v.status === "Programada" && v.duration < 20);
  return <div className="day-agenda panel">
    <div className="day-legend"><span><i className="legend-dot active" />Visita</span><span><i className="legend-dot blocked" />Bloqueo</span><span><i className="legend-dot travel" />Desplazamiento · 30 min</span></div>
    <p className="day-hint">Pulsa una visita para consultar o cambiarla. Desliza horizontalmente para ver todo el equipo.</p>
    <div className="day-scroll" tabIndex={0} aria-label="Agenda diaria del equipo, desplazable horizontalmente">
      <div className="day-grid" style={{ gridTemplateColumns: `54px repeat(${team.length}, minmax(155px, 1fr))` }}>
        <div className="day-time-label">Hora</div>{team.map((t) => <div className="day-tech" key={t.id}><span className={`avatar avatar-${t.id % 4}`} aria-hidden="true">{t.name.split(" ").map((s) => s[0]).join("")}</span><strong>{t.name}</strong></div>)}
        <div className="day-axis" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i} style={{ top: `${i / 9 * 100}%` }}>{formatMinute(480 + i * 60)}</span>)}</div>
        {team.map((t) => { const entries = dayEntries(date, t.id, visits, blocks); return <div className="day-track" key={t.id} aria-label={`Agenda de ${t.name}`}>
          {!entries.length && <p className="day-empty">Sin visitas ni bloqueos</p>}
          {entries.map((entry) => {
            const position = timelinePosition(entry.startMinute, entry.endMinute);
            const label = `${entry.label}, ${t.name}, ${formatMinute(entry.startMinute)}–${formatMinute(entry.endMinute)}`;
            const style = { top: `${position.top}%`, height: `${position.height}%` };
            const content = <>{entry.endMinute - entry.startMinute >= 20 && <><strong>{formatMinute(entry.startMinute)}–{formatMinute(entry.endMinute)}</strong><span>{entry.label}</span></>}</>;
            return entry.kind === "visit" ? <button type="button" key={entry.id} className={`day-entry visit ${entry.endMinute - entry.startMinute < 20 ? "short" : ""}`} style={style} title={label} aria-label={`Ver visita: ${label}`} onClick={() => onDetail(entry.visitId!)}>{content}</button> : <div key={entry.id} className={`day-entry ${entry.kind}`} style={style} title={label} aria-label={label}>{content}</div>;
          })}
        </div>; })}
      </div>
    </div>
    {!!shortVisits.length && <section className="short-visits"><h3>Acceso a visitas cortas</h3><p>Se dibujan a escala en la agenda. También puedes abrirlas aquí.</p>{shortVisits.map((v) => <button type="button" key={v.id} className="button secondary" onClick={() => onDetail(v.id)}>{formatMinute(v.startMinute)} · {v.duration} min · {v.technicianName} · {v.siteName}</button>)}</section>}
    <p className="day-footer">Los desplazamientos muestran un tramo disponible de 30 minutos entre obras. Las visitas canceladas se conservan en el listado.</p>
  </div>;
}
