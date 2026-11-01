"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/client/api";
import type { Catalogs } from "@/server/visits";
import { Modal } from "./modal";

export function CatalogManager({ catalogs, onChange, onClose }: { catalogs: Catalogs; onChange: (value: Catalogs) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"sites" | "types">("sites");
  const [siteId, setSiteId] = useState(String(catalogs.sites[0]?.id ?? ""));
  const [typeId, setTypeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const site = catalogs.sites.find((s) => String(s.id) === siteId);
  const type = catalogs.types.find((t) => String(t.id) === typeId);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(""); setMessage("");
    try {
      if (tab === "sites" && site) {
        const { site: saved } = await api<{ site: Catalogs["sites"][number] }>(`/api/sites/${site.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address: data.get("address"), contact: data.get("contact"), phone: data.get("phone"), accessNotes: data.get("accessNotes") }) });
        onChange({ ...catalogs, sites: catalogs.sites.map((s) => s.id === saved.id ? saved : s) });
      } else if (tab === "types") {
        const { type: saved } = await api<{ type: Catalogs["types"][number] }>(type ? `/api/types/${type.id}` : "/api/types", { method: type ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.get("name"), duration: Number(data.get("duration")), instructions: data.get("instructions"), active: data.get("active") === "on" }) });
        onChange({ ...catalogs, types: [...catalogs.types.filter((t) => t.id !== saved.id), saved].sort((a, b) => a.name.localeCompare(b.name, "es")) });
        setTypeId(String(saved.id));
      }
      setMessage("Cambios guardados.");
    } catch (error) { setError(error instanceof Error ? error.message : "No se pudo guardar."); }
    finally { setBusy(false); }
  }

  return <Modal title="Obras y tipos de visita" busy={busy} onClose={onClose}>
    <div className="segmented" aria-label="Contenido del catálogo"><button type="button" disabled={busy} aria-pressed={tab === "sites"} onClick={() => { setTab("sites"); setMessage(""); setError(""); }}>Obras</button><button type="button" disabled={busy} aria-pressed={tab === "types"} onClick={() => { setTab("types"); setMessage(""); setError(""); }}>Tipos de visita</button></div>
    <p className="detail-help">{tab === "sites" ? "Datos de contacto y acceso para que el técnico llegue preparado. Todos son opcionales." : "Guarda duraciones e indicaciones habituales. Al programar podrás ajustar la duración."}</p>
    {tab === "sites" ? <label>Obra<select disabled={busy} value={siteId} onChange={(e) => { setSiteId(e.target.value); setMessage(""); setError(""); }}>{catalogs.sites.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.municipality}</option>)}</select></label> : <label>Tipo<select disabled={busy} value={typeId} onChange={(e) => { setTypeId(e.target.value); setMessage(""); setError(""); }}><option value="">Crear un tipo nuevo</option>{catalogs.types.map((t) => <option key={t.id} value={t.id}>{t.name}{t.active ? "" : " · Desactivado"}</option>)}</select></label>}
    <form key={`${tab}-${siteId}-${typeId}`} className="detail-form" onSubmit={save}>
      <fieldset disabled={busy}>
        {tab === "sites" && site ? <>
          <label>Dirección<input name="address" maxLength={300} defaultValue={site.address} autoComplete="street-address" /></label>
          <div className="time-fields"><label>Persona de contacto<input name="contact" maxLength={120} defaultValue={site.contact} autoComplete="name" /></label><label>Teléfono<input name="phone" type="tel" maxLength={40} defaultValue={site.phone} autoComplete="tel" /></label></div>
          <label>Indicaciones de acceso<textarea name="accessNotes" maxLength={2000} rows={3} defaultValue={site.accessNotes} /></label>
        </> : <>
          <label>Nombre<input name="name" required maxLength={100} defaultValue={type?.name ?? ""} placeholder="Por ejemplo, revisión de obra" /></label>
          <label>Duración habitual (minutos)<input name="duration" type="number" required min={1} max={540} step={1} defaultValue={type?.duration ?? 60} /></label>
          <label>Indicaciones opcionales<textarea name="instructions" maxLength={2000} rows={3} defaultValue={type?.instructions ?? ""} /></label>
          <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked={type?.active ?? true} />Disponible para nuevas visitas</label>
          <p className="detail-help">Desactivarlo conserva las visitas anteriores. Sus horas y sus indicaciones guardadas no cambian.</p>
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="notice success" role="status">{message}</p>}
        <div className="dialog-actions"><button className="button primary" type="submit">{busy ? "Guardando…" : "Guardar cambios"}</button></div>
      </fieldset>
    </form>
  </Modal>;
}
