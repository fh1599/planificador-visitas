import { CalendarDays, RefreshCw } from "lucide-react";
import { Planner } from "@/components/planner";
import { getDatabase } from "@/db/connection";
import { localDate } from "@/domain/time";
import { visitService } from "@/server/visits";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function loadAgenda(today: string) {
  try {
    const service = visitService(getDatabase());
    const [catalogs, visits] = await Promise.all([service.catalogs(), service.list({ date: today })]);
    return { catalogs, visits };
  } catch {
    return null;
  }
}

export default async function Home() {
  const today = localDate();
  const data = await loadAgenda(today);
  if (!data) {
    return <main className="unavailable">
      <CalendarDays size={32} aria-hidden="true" />
      <h1>La agenda no está disponible</h1>
      <p>No hemos podido conectar con las visitas. Espera unos segundos y vuelve a intentarlo.</p>
      <form action="/" method="get"><button className="button primary" type="submit"><RefreshCw size={16} aria-hidden="true" /> Volver a cargar</button></form>
    </main>;
  }
  return <Planner catalogs={data.catalogs} initialVisits={data.visits} today={today} />;
}
