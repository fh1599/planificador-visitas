import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planificador de visitas",
  description: "Organiza las visitas de tu equipo con horarios y desplazamientos comprobados.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
