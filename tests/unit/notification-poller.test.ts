import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { watchNotifications } from "../../src/client/notification-poller";

let page: EventTarget & { visibilityState: string };
let browser: EventTarget;
beforeEach(() => { vi.useFakeTimers(); page = Object.assign(new EventTarget(), { visibilityState: "visible" }); browser = new EventTarget(); vi.stubGlobal("document", page); vi.stubGlobal("window", browser); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it("actualiza al abrir, volver al foco y cada 30 s visibles; se detiene al desmontar", async () => {
  const load = vi.fn().mockResolvedValue({ value: 1 }); const data = vi.fn();
  const watcher = watchNotifications(load, data, vi.fn());
  await vi.advanceTimersByTimeAsync(0); expect(load).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(30000); expect(load).toHaveBeenCalledTimes(2);
  page.visibilityState = "hidden"; await vi.advanceTimersByTimeAsync(30000); expect(load).toHaveBeenCalledTimes(2);
  page.visibilityState = "visible"; page.dispatchEvent(new Event("visibilitychange")); await vi.advanceTimersByTimeAsync(0); expect(load).toHaveBeenCalledTimes(3);
  browser.dispatchEvent(new Event("focus")); await vi.advanceTimersByTimeAsync(0); expect(load).toHaveBeenCalledTimes(4);
  watcher.stop(); await vi.advanceTimersByTimeAsync(30000); browser.dispatchEvent(new Event("focus")); expect(load).toHaveBeenCalledTimes(4);
});
it("se recupera de una caída del servidor sin duplicar peticiones en vuelo", async () => {
  const failed = vi.fn(), data = vi.fn();
  const load = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ ok: true });
  const watcher = watchNotifications(load, data, failed);
  await vi.advanceTimersByTimeAsync(0); expect(failed).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(30000); expect(data).toHaveBeenCalledWith({ ok: true }); watcher.stop();
  let resolve!: (value: string) => void;
  const slow = vi.fn(() => new Promise<string>((done) => { resolve = done; }));
  const afterStop = vi.fn(); const waiting = watchNotifications(slow, afterStop, vi.fn());
  await vi.advanceTimersByTimeAsync(60000); browser.dispatchEvent(new Event("focus")); expect(slow).toHaveBeenCalledTimes(1);
  waiting.stop(); resolve("late"); await vi.advanceTimersByTimeAsync(0); expect(afterStop).not.toHaveBeenCalled();
});
