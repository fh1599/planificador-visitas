"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({ title, busy = false, onClose, children }: { title: string; busy?: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} className="detail-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="detail-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" type="button" onClick={onClose} disabled={busy} aria-label="Cerrar panel" autoFocus><X size={18} /></button></div>
    {children}
  </dialog>;
}
