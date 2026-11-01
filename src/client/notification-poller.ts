/** Visible-page polling. Only GET data is retried; a failed refresh never retries a mutation. */
export function watchNotifications<T>(load: (signal: AbortSignal) => Promise<T>, onData: (value: T) => void, onError: () => void) {
  let active = true, pending = false;
  const controller = new AbortController();
  async function refresh() {
    if (!active || pending || document.visibilityState !== "visible") return;
    pending = true;
    try { const data = await load(controller.signal); if (active) onData(data); }
    catch { if (active) onError(); }
    finally { pending = false; }
  }
  const onVisible = () => { void refresh(); };
  window.addEventListener("focus", onVisible);
  document.addEventListener("visibilitychange", onVisible);
  const timer = setInterval(onVisible, 30000);
  void refresh();
  return { refresh, stop() { active = false; controller.abort(); clearInterval(timer); window.removeEventListener("focus", onVisible); document.removeEventListener("visibilitychange", onVisible); } };
}
