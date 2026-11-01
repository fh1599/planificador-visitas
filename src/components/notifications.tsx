"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { api } from "@/client/api";
import { watchNotifications } from "@/client/notification-poller";
import { markReadKeys, parseReadKeys, type Notification } from "@/domain/notifications";
import type { NotificationFeed } from "@/server/notifications";
import { Modal } from "./modal";

const STORAGE_KEY = "planificador:read-notifications:v1";
export function Notifications({ revision, onVisit, onBlocks }: { revision: number; onVisit: (id: number) => void; onBlocks: () => void }) {
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState<NotificationFeed | null>(null);
  const [readKeys, setReadKeys] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const watcher = useRef<ReturnType<typeof watchNotifications<NotificationFeed>> | null>(null);
  useEffect(() => {
    const polling = watchNotifications((signal) => api<NotificationFeed>("/api/notifications", { signal }), (data) => {
      setFeed(data); setError(false);
      try { if (!storageError) setReadKeys(parseReadKeys(localStorage.getItem(STORAGE_KEY))); } catch { /* Keep this session's read state. */ }
    }, () => setError(true));
    watcher.current = polling;
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) setReadKeys(parseReadKeys(event.newValue)); };
    window.addEventListener("storage", sync);
    return () => { polling.stop(); window.removeEventListener("storage", sync); };
  }, [revision, storageError]);
  const reminders = error ? [] : feed?.reminders ?? [];
  const activity = feed?.activity ?? [];
  const all = [...reminders, ...activity];
  const unread = all.filter((item) => !readKeys.includes(item.key)).length;
  function mark(keys: string[]) {
    const next = markReadKeys(readKeys, keys); setReadKeys(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setStorageError(false); } catch { setStorageError(true); }
  }
  function show(item: Notification) {
    mark([item.key]); setOpen(false);
    if (item.visitId) onVisit(item.visitId); else if (item.blockId) onBlocks();
  }
  function items(values: Notification[]) {
    return <ul className="notification-list">{values.map((item) => <li key={item.key} className={readKeys.includes(item.key) ? "read" : "unread"}><button type="button" className="notification-open" onClick={() => show(item)}><strong>{!readKeys.includes(item.key) && <span className="unread-dot" aria-label="Sin leer" />}{item.title}</strong><p>{item.text}</p>{item.kind === "activity" && <time dateTime={item.createdAt}>{new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" }).format(new Date(item.createdAt))}</time>}</button>{!readKeys.includes(item.key) && <button type="button" className="text-button mark-read" onClick={() => mark([item.key])}>Marcar leído</button>}</li>)}</ul>;
  }
  return <><button className="button secondary notification-trigger" type="button" onClick={() => { setOpen(true); void watcher.current?.refresh(); }} aria-label={`Avisos, ${unread} sin leer${error ? ", sin actualizar" : ""}`}><Bell size={16} aria-hidden="true" />Avisos{unread > 0 && <span className="notification-count">{unread}</span>}{error && <span aria-hidden="true">!</span>}</button>
    {open && <Modal title="Avisos de la agenda" onClose={() => setOpen(false)}><p className="detail-help">Actividad compartida del equipo. La lectura se guarda en este navegador. Los recordatorios funcionan mientras la aplicación está abierta y conectada.</p>
      <div className="inline-actions"><button className="button secondary" type="button" onClick={() => void watcher.current?.refresh()}>Actualizar avisos</button><button className="text-button" type="button" disabled={!unread} onClick={() => mark(all.map((item) => item.key))}>Marcar todos como leídos</button></div>
      {error && <p className="form-error" role="alert">No se han podido actualizar los avisos. Los recordatorios se ocultan hasta recuperar la conexión; la actividad mostrada pertenece a la última consulta.</p>}
      {storageError && <p className="detail-help" role="status">La lectura se mantiene en esta sesión; el navegador no ha permitido guardarla para después.</p>}
      {!feed && !error && <p className="detail-help">Cargando avisos…</p>}
      <section className="detail-section"><h3>En los próximos 30 minutos</h3>{reminders.length ? items(reminders) : <p className="detail-help">{error ? "Pendiente de actualizar." : "No hay visitas próximas en la última consulta."}</p>}</section>
      <section className="detail-section"><h3>Actividad reciente</h3><p className="detail-help">Últimos 50 cambios de los últimos 7 días. Los cambios de una visita también se conservan en su historial.</p>{activity.length ? items(activity) : <p className="detail-help">Todavía no hay actividad reciente.</p>}</section>
      {feed && <p className="detail-help">Consulta del servidor: {new Intl.DateTimeFormat("es-ES", { timeStyle: "medium", timeZone: "Europe/Madrid" }).format(new Date(feed.serverTime))} · Madrid. Se actualiza cada 30 segundos mientras la página está visible y al recuperar el foco.</p>}
    </Modal>}
  </>;
}
